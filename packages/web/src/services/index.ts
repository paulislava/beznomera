import { createApiService } from '@/utils/api-service';
import AUTH_API from '@shared/auth/auth.api';
import CAR_API from '@shared/car/car.api';
import FILE_API from '@shared/file/file.api';
import { USER_API } from '@shared/user/user.api';

export const createApi = (userToken?: string) => {
  return {
    auth: createApiService(AUTH_API, userToken),
    car: createApiService(CAR_API, userToken),
    file: createApiService(FILE_API, userToken),
    user: createApiService(USER_API, userToken)
  };
};

const api = createApi();

export const authService = api.auth;
export const carService = api.car;
export const fileService = api.file;
export const userService = api.user;
