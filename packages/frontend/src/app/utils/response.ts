import { ResponseWithCode } from '@paulislava/shared/responses'

export const isResponseWithCode = (response: unknown): response is ResponseWithCode => {
  return typeof response === 'object' && response !== null && 'code' in response
}

export interface ResponseWithMessage {
  message: string
}

export const responseHasMessage = (response: unknown): response is ResponseWithMessage => {
  return typeof response === 'object' && response !== null && 'message' in response
}
