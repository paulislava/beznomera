export const prefixPath = (path: string): string =>
  (process.env.ROUTE_PREFIX ? `/${process.env.ROUTE_PREFIX}` : '') + path;
