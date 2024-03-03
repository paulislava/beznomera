import env from '@/utils/env';
import { APIInfo } from '@paulislava/shared/api-routes';

export const BACKEND_URL = env('BACKEND_URL');

if (!BACKEND_URL) {
  throw new Error(`BACKEND_URL is not defined`);
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

    if (res.status < 200 || res.status >= 300) {
      throw new Error(`${res.status}: ${res.statusText}`);
    }

    return res;
  }

  async get<Path extends keyof T>(
    path: Path,
    pathSegments?: Parameters<APIInfo<T>['simpleRoutes'][Path]>,
    options?: RequestInit
  ): Promise<ReturnType<T[Path]>> {
    const res = await this.fetch({ path, options, pathSegments: pathSegments });

    return res.json();
  }

  async post<Path extends keyof T>(
    path: Path,
    body?: T[Path] extends (...args: any[]) => any ? Parameters<T[Path]>[0] : any,
    pathSegments?: Parameters<APIInfo<T>['simpleRoutes'][Path]>,
    options?: RequestInit
  ): Promise<ReturnType<T[Path]>> {
    const res = await this.fetch({
      path,
      pathSegments,
      options: {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        },
        body: body && JSON.stringify(body)
      }
    });

    return res.json();
  }
}

export function createApiService<T extends { [K in keyof T]: (...args: any[]) => any }>(
  api: APIInfo<T>,
  methods?: (service: ApiService<T>) => Partial<T>
): T {
  const service = new ApiService<T>(api);

  const rawMethods = methods && methods(service);

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
              return service.post(key as keyof T, body, pathSegments as any);
            default:
              return service.get(key as keyof T, args as any);
          }
        }
      };
    }, {});

  return { ...rawMethods, ...readyMethods } as T;
}
