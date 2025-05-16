import { createApiService } from '@/utils/api-service';
import AUTH_API from '@shared/auth/auth.api';
import CAR_API from '@shared/car/car.api';
import FILE_API from '@shared/file/file.api';

export const authService = createApiService(AUTH_API);
export const carService = createApiService(CAR_API);
export const fileService = createApiService(FILE_API);
