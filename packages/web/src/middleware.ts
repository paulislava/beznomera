// Source - https://stackoverflow.com/a
// Posted by user16168078
// Retrieved 2025-12-22, License - CC BY-SA 4.0

import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  // Store current request url in a custom header, which you can read later
  const requestHeaders = new Headers(request.headers);
  const url = new URL(request.url);
  requestHeaders.set('x-url', url.pathname + url.search);

  return NextResponse.next({
    request: {
      // Apply new request headers
      headers: requestHeaders
    }
  });
}
