import { HttpException } from '@nestjs/common';
import { ResponseWithCode } from '@paulislava/shared/responses';
import { ResponseCode } from '@paulislava/shared/errors';

import { AuthMode } from './auth.types';

export class AuthServiceException extends HttpException {
  constructor(response: string | ResponseWithCode, status = 409) {
    super(response, status);
  }
}

export class UserNotFound extends AuthServiceException {
  constructor(
    readonly authMode: AuthMode,
    readonly identifier: string,
  ) {
    super({
      code: ResponseCode.USER_OR_DRAFT_NOT_FOUND,
      message: `User was not found in users and users' drafts for auth mode '${authMode}' and identifier '${identifier}'`,
    });
  }
}

export class WrongAuthCode extends AuthServiceException {
  constructor() {
    super({
      code: ResponseCode.WRONG_AUTH_CODE,
      message: 'Wrong auth code was provided',
    });
  }
}
