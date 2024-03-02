import { URLSearchParams } from 'url'

import fetch, { BodyInit, RequestInit } from 'node-fetch'

import { ClientResponseError } from './http-clients.exceptions'

import ReadableStream = NodeJS.ReadableStream

export abstract class BaseHttpClient {
  protected abstract host: string

  protected async get<T>(path: string, body?: Record<string, string>): Promise<T> {
    const params = body ? '?' + new URLSearchParams(body).toString() : ''
    return this.httpBase<T>(path + params, { method: 'GET' })
  }

  protected post<Res>(path: string, body?: BodyInit): Promise<Res> {
    return this.httpBase(path, { method: 'POST', body })
  }

  protected delete<Res>(path: string, body?: BodyInit): Promise<Res> {
    return this.httpBase(path, { method: 'DELETE', body })
  }

  protected async download(path: string, body?: BodyInit): Promise<ReadableStream | null> {
    const init: RequestInit = { method: 'GET', body }
    const resp = await fetch(this.host + path, {
      ...init,
      headers: { ...init?.headers, Authorization: this.authorization }
    })
    if (resp.status >= 300 || resp.status < 200) {
      throw new ClientResponseError(resp.status, resp.statusText)
    }

    return resp.body
  }

  protected async httpBase<T>(path: string, init?: RequestInit): Promise<T> {
    const url = this.host + path
    console.info(`Fetch url: ${url}`)
    const resp = await fetch(url, {
      ...init,
      headers: { ...init?.headers, Authorization: this.authorization }
    })

    if (resp.status >= 300 || resp.status < 200) {
      throw new ClientResponseError(resp.status, resp.statusText)
    }

    const contentType = resp.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      return resp.json() as Promise<T>
    }

    if (contentType?.includes('text/csv')) {
      return resp.buffer() as unknown as Promise<T>
    }

    return resp.text() as unknown as Promise<T>
  }

  protected get authorization(): string {
    return ''
  }
}
