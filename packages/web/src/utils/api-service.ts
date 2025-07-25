import { APIInfo } from '@shared/api-routes';
import { ResponseCode } from '@shared/errors';
import { ResponseWithCode } from '@shared/responses';
import { isClient } from './env';
import React from 'react';
import { AUTH_USER_TOKEN_HEADER } from '@shared/auth/auth.api';

export const BACKEND_URL = isClient
  ? (process.env.NEXT_PUBLIC_BACKEND_URL ?? '/api')
  : (process.env.BACKEND_URL ?? 'http://localhost:3000');

// Проверяем только в клиентской части
if (isClient && !process.env.NEXT_PUBLIC_BACKEND_URL) {
  console.warn('NEXT_PUBLIC_BACKEND_URL is not defined, using default /api');
}

class ApiService<T extends { [K in keyof T]: (...args: any[]) => any }> {
  private readonly basePath: string;
  private readonly api: APIInfo<T>;
  private readonly apiToken: string;
  private readonly userToken: string;

  constructor(api: APIInfo<T>, userToken?: string) {
    if (!api) {
      throw new Error(`api is not defined`);
    }

    this.api = api;
    this.basePath = api.path.startsWith('/') ? api.path : `/${api.path}`;
    this.apiToken = process.env.BACKEND_API_TOKEN ?? '';
    this.userToken = userToken ?? '';
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

    const headers: Record<string, unknown> = { ...(options?.headers ?? {}) };

    if (this.apiToken) {
      headers['Authorization'] = `Bearer ${this.apiToken}`;
    }

    if (this.userToken) {
      headers[AUTH_USER_TOKEN_HEADER] = this.userToken;
    }

    const res = await fetch(
      `${BACKEND_URL}${this.basePath}${route ? `/${route}` : ''}${
        queryParams ? `?${new URLSearchParams(queryParams).toString()}` : ''
      }`,
      {
        credentials: 'include',
        next: {
          revalidate: 60 * 60
        },
        ...options,
        headers: headers as HeadersInit
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
  userToken?: string,
  methods?: (service: ApiService<T>) => Partial<T>
): T {
  const service = new ApiService<T>(api, userToken);

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

// Хук для работы с API в React компонентах
export function useAPI<T>(func: () => Promise<T>) {
  const [value, setValue] = React.useState<T>();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await func();
        setValue(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [func]);

  return { value, loading, error };
}
