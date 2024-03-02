import 'express'
import { RequestUser } from '~/app/users/user.types'

declare module 'express' {
  export interface Request extends ExpressRequest {
    timedout: boolean
    user?: RequestUser
    rawBody?: string
  }
}
