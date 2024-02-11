import { ResponseWithCode } from '@paulislava/shared/responses'

export default class BackendError extends Error {
  constructor(message: string, private info: ResponseWithCode, readonly status: number) {
    super(message)
    Object.setPrototypeOf(this, BackendError.prototype)
  }

  get data(): ResponseWithCode {
    return this.info
  }
}
