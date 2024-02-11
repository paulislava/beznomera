import { useRouter } from 'next/router'

import BackendError from './api-error'
import { isResponseWithCode, responseHasMessage } from './response'

type ResponseMapper<T> = (data: Response) => Promise<T> | T

export class FetchError extends Error {
  constructor(message: string, readonly status: number, private readonly response: unknown) {
    super(message)
    this.name = 'FetchError'
    Object.setPrototypeOf(this, FetchError.prototype)
  }

  get responseData(): unknown {
    return this.response
  }
}

function handleResponse<R>(response: Response, responseMapper?: ResponseMapper<R>): Promise<R> {
  if (responseMapper) {
    return Promise.resolve(responseMapper(response))
  } else {
    const contentType: string | null = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return Promise.resolve<R>(response.json())
    } else {
      return Promise.resolve<R>(response.text() as unknown as R)
    }
  }
}

export const BASE_URL: string = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  responseMapper?: ResponseMapper<T>
): Promise<T> {
  const response: Response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options?.headers
    },
    credentials: 'include'
  })

  const handledResponse = await handleResponse(response, responseMapper)

  if (!response.ok) {
    if (isResponseWithCode(handledResponse)) {
      throw new BackendError(handledResponse.message, handledResponse, response.status)
    } else {
      throw new FetchError(
        responseHasMessage(handledResponse) ? handledResponse.message : response.statusText,
        response.status,
        response
      )
    }
  }

  return handledResponse
}
