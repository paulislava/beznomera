type FunctionalRoute = (...pathSegments: string[]) => string;

interface RouteProps {
  method: 'GET' | 'POST';
}

const STANDART_API_METHOD: RouteProps['method'] = 'GET';

interface FullFunctionalRoute extends RouteProps {
  path: FunctionalRoute;
}

interface FullStringRoute extends RouteProps {
  path: string;
}

export type Route = FunctionalRoute | string | FullFunctionalRoute | FullStringRoute;

export type APIRoutes<T> = {
  [K in keyof T]: Route;
};

interface AdditionalRoutes<T> {
  backendRoutes: {
    [K in keyof T]: string;
  };
  simpleRoutes: {
    [K in keyof T]: FunctionalRoute;
  };
  fullRoutes: {
    [k in keyof T]: FullFunctionalRoute;
  };
}

export interface APIInfo<T> extends AdditionalRoutes<T> {
  path: string;
  rawRoutes: APIRoutes<T>;
}

function isFunctionalRoute(route: Route): route is FunctionalRoute {
  return typeof route === 'function';
}

function isStringRoute(route: Route): route is string {
  return typeof route === 'string';
}

function isFullFunctionalRoute(route: Route): route is FullFunctionalRoute {
  return typeof route === 'object' && 'path' in route && isFunctionalRoute(route.path);
}

function isFullStringRoute(route: Route): route is FullStringRoute {
  return typeof route === 'object' && 'path' in route && isStringRoute(route.path);
}

export function apiInfo<T>(rawRoutes: APIRoutes<T>, controllerPath?: string): APIInfo<T> {
  const { backendRoutes, simpleRoutes, fullRoutes } = Object.keys(rawRoutes).reduce<
    AdditionalRoutes<T>
  >(
    (acc, key) => {
      const route = (rawRoutes as Record<string, Route>)[key];

      let backendRoute: string;
      let simpleRoute: FunctionalRoute;
      let fullRoute: FullFunctionalRoute;

      if (isFullFunctionalRoute(route)) {
        backendRoute = route.path();
        simpleRoute = route.path;
        fullRoute = route;
      } else if (isFullStringRoute(route)) {
        backendRoute = route.path;
        simpleRoute = () => route.path;
        fullRoute = { ...route, path: simpleRoute };
      } else if (isFunctionalRoute(route)) {
        backendRoute = route();
        simpleRoute = route;
        fullRoute = {
          method: STANDART_API_METHOD,
          path: simpleRoute
        };
      } else {
        backendRoute = route;
        simpleRoute = () => route;
        fullRoute = {
          method: STANDART_API_METHOD,
          path: simpleRoute
        };
      }

      return {
        backendRoutes: { ...acc.backendRoutes, [key]: backendRoute },
        simpleRoutes: { ...acc.simpleRoutes, [key]: simpleRoute },
        fullRoutes: { ...acc.fullRoutes, [key]: fullRoute }
      };
    },
    { backendRoutes: {}, simpleRoutes: {}, fullRoutes: {} } as AdditionalRoutes<T>
  );

  return {
    path: controllerPath || '/',
    rawRoutes,
    backendRoutes,
    simpleRoutes,
    fullRoutes
  };
}
