import { HttpException } from '@nestjs/common';
import { ResponseWithCode } from '@paulislava/shared/responses';
import { ResponseCode } from '@paulislava/shared/errors';

export class FileServiceException extends HttpException {
  constructor(response: string | ResponseWithCode, status = 409) {
    super(response, status);
  }
}

export class WrongMimetypeException extends FileServiceException {
  constructor() {
    super(
      {
        message: 'Только PNG файлы разрешены',
        code: ResponseCode.WRONG_MIMETYPE,
      },
      400,
    );
  }
} 