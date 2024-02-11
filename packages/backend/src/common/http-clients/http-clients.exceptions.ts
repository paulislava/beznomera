import { FetchError } from 'node-fetch'

export class MissedEnvironmentVariableException extends Error {
  constructor(requredEnvironment: string) {
    super(`${requredEnvironment} is not found in environment variables`)

    Object.setPrototypeOf(this, Error.prototype)
  }
}

export class ClientResponseError extends FetchError {
  constructor(readonly status: number, readonly statusText: string) {
    super(`Server responded with status ${status} and text ${statusText}.`, 'responseError')
  }
}
