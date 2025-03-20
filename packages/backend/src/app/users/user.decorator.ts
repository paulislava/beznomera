import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { RequestUser } from './user.types';

export const CurrentUser = createParamDecorator(
  (optional: boolean = false, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();

    if (!request.user && !optional) {
      throw new Error(`No user was loaded in request`);
    }

    return request.user as RequestUser | null;
  },
);
