import { APIRoutes } from '@paulislava/shared/api-routes';

export const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error(`BACKEND_URL is not defined`);
}

export class ApiService<T> {
  private readonly basePath;
  private readonly pathRoutes: APIRoutes<T>;

  constructor(pathRoutes: APIRoutes<T>, basePath?: string) {
    if (!pathRoutes) {
      throw new Error(`pathRoutes is not defined`);
    }

    this.pathRoutes = pathRoutes;
    this.basePath = basePath || '/';
  }

  protected async fetch(path: keyof T, options?: RequestInit): Promise<Response> {
    const route = this.pathRoutes[path]();

    const res = await fetch(`${BACKEND_URL}${this.basePath}${route}`, options);

    if (res.status < 200 || res.status >= 300) {
      throw new Error(`${res.status}: ${res.statusText}`);
    }

    return res;
  }

  protected post<Path extends keyof T>(
    path: Path,
    body: T[Path] extends (...args: any[]) => any ? Parameters<T[Path]>[0] : any,
    options?: RequestInit
  ): Promise<Response> {
    return this.fetch(path, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      body: JSON.stringify(body)
    });
  }
}
