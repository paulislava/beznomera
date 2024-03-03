import { createApiService } from '@/utils/api';
import AUTH_API from '@shared/auth/auth.api';
import CAR_API from '@shared/car/car.api';

export const authService = createApiService(AUTH_API);
export const carService = createApiService(CAR_API);
