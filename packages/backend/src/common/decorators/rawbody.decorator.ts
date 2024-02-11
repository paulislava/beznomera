import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export const RawBody = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<Request>()
  const data = request.rawBody
  return data ?? ''
})
