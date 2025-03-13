import env from '@/utils/env';
import { APIInfo } from '@paulislava/shared/api-routes';
import { ResponseCode } from '@shared/errors';
import { ResponseWithCode } from '@shared/responses';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export const BACKEND_URL = env('BACKEND_URL', '/api');

if (!BACKEND_URL) {
  console.error(`BACKEND_URL is not defined`);
  // throw new Error(`BACKEND_URL is not defined`);
}

class ApiService<T extends { [K in keyof T]: (...args: any[]) => any }> {
  private readonly basePath: string;
  private readonly api: APIInfo<T>;

  constructor(api: APIInfo<T>) {
    if (!api) {
      throw new Error(`api is not defined`);
    }

    this.api = api;
    this.basePath = api.path.startsWith('/') ? api.path : `/${api.path}`;
  }

  async fetch<Path extends keyof T>({
    path,
    options,
    queryParams,
    pathSegments
  }: {
    path: Path;
    options?: RequestInit;
    queryParams?: Record<string, any>;
    pathSegments?: Parameters<APIInfo<T>['simpleRoutes'][Path]>;
  }): Promise<Response> {
    const route = this.api.simpleRoutes[path](...(pathSegments ?? []));

    const res = await fetch(
      `${BACKEND_URL}${this.basePath}${route ? `/${route}` : ''}${
        queryParams ? `?${new URLSearchParams(queryParams).toString()}` : ''
      }`,
      {
        credentials: 'include',
        ...options
      }
    );

    const contentType = res.headers.get('Content-type');

    if (res.status < 200 || res.status >= 300) {
      const response: Maybe<ResponseWithCode> = contentType?.includes('application/json')
        ? await res.json()
        : null;

      throw response ?? ({ code: ResponseCode.Error, message: res.statusText } as ResponseWithCode);
    }

    return res;
  }

  async get<Path extends keyof T>(
    path: Path,
    pathSegments?: Parameters<APIInfo<T>['simpleRoutes'][Path]>,
    options?: RequestInit
  ): Promise<ReturnType<T[Path]>> {
    const res = await this.fetch({ path, options, pathSegments: pathSegments });

    return this.formatResult(res);
  }

  async post<Path extends keyof T>(
    path: Path,
    body?: (T[Path] extends (...args: any[]) => any ? Parameters<T[Path]>[0] : any) | FormData,
    pathSegments?: Parameters<APIInfo<T>['simpleRoutes'][Path]>,
    options?: RequestInit
  ): Promise<ReturnType<T[Path]>> {
    const isFormData = body instanceof FormData;

    const res = await this.fetch({
      path,
      pathSegments,
      options: {
        ...options,
        method: 'POST',
        headers: {
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          ...options?.headers
        },
        body: isFormData ? body : JSON.stringify(body)
      }
    });

    return this.formatResult(res);
  }

  async delete<Path extends keyof T>(
    path: Path,
    pathSegments?: Parameters<APIInfo<T>['simpleRoutes'][Path]>,
    options?: RequestInit
  ): Promise<ReturnType<T[Path]>> {
    const res = await this.fetch({
      path,
      options: { ...options, method: 'DELETE' },
      pathSegments: pathSegments
    });

    return this.formatResult(res);
  }

  private async formatResult(res: Response) {
    if (res.headers.get('Content-Type')?.startsWith('application/json')) {
      return res.json();
    } else if (res.headers.get('Content-length') === '0') {
      return;
    }

    return res.text();
  }
}

export function createApiService<T extends { [K in keyof T]: (...args: any[]) => any }>(
  api: APIInfo<T>,
  methods?: (service: ApiService<T>) => Partial<T>
): T {
  const service = new ApiService<T>(api);

  const rawMethods = methods?.(service);

  const methodsKeys = Object.keys(rawMethods ?? {});

  const readyMethods = Object.keys(api.fullRoutes)
    .filter(key => !methodsKeys.includes(key))
    .reduce((acc, key) => {
      return {
        ...acc,
        [key]: (...args: any[]) => {
          const route = api.fullRoutes[key as keyof T];

          switch (route.method) {
            case 'POST':
              const body = route.noBody ? undefined : args[0];
              const pathSegments = route.noBody ? args : args.slice(1);
              return service.post(key as keyof T, body, pathSegments as any, {
                headers: route.headers
              });
            case 'DELETE':
              return service.delete(key as keyof T, args as any, {
                headers: route.headers
              });
            default:
              return service.get(key as keyof T, args as any, {
                headers: route.headers
              });
          }
        }
      };
    }, {});

  return { ...rawMethods, ...readyMethods } as T;
}

export function useAPI<T>(func: () => Promise<T>) {
  const [value, setValue] = useState<T>();

  const callbackFunction = useCallback(() => {
    func().then(setValue);
  }, [func]);

  useFocusEffect(callbackFunction);

  return value;
}
