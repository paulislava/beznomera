import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseWithCode } from '@paulislava/shared/responses';
import { ResponseCode, SubmissionError } from '@paulislava/shared/errors';

export class CarServiceException extends HttpException {
  constructor(response: string | ResponseWithCode, status = 409) {
    super(response, status);
  }
}

export class CarNotFoundException extends CarServiceException {
  constructor(carId: number) {
    super(
      {
        message: `Автомобиль с ID ${carId} не найден`,
        code: ResponseCode.NOT_FOUND,
      },
      404,
    );
  }
}

export class CallNeedTimeoutException extends CarServiceException {
  constructor(carId: number) {
    super(
      {
        message: 'Нельзя так часто звать водителя',
        code: ResponseCode.CALL_NEED_TIMEOUT,
      },
      429,
    );
  }
}

export class ValidationException extends HttpException {
  constructor(errors: Record<string, SubmissionError[]>) {
    super(
      {
        message: 'Ошибка валидации',
        errors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
