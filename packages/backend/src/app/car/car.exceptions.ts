import { HttpException } from '@nestjs/common';
import { ResponseWithCode } from '@paulislava/shared/responses';
import { ResponseCode } from '@paulislava/shared/errors';

export class CarServiceException extends HttpException {
  constructor(response: string | ResponseWithCode, status = 409) {
    super(response, status);
  }
}

export class CallNeedTimeoutException extends CarServiceException {
  constructor(carId: number) {
    super({
      code: ResponseCode.CALL_NEED_TIMEOUT,
      message: `Call to driver of car (id: ${carId})  needs timeout`,
    });
  }
}
