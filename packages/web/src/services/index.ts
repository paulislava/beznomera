import { createApiService } from '@/utils/api-service';
import AUTH_API from '@shared/auth/auth.api';
import CAR_API from '@shared/car/car.api';
import FILE_API from '@shared/file/file.api';
import { USER_API } from '@shared/user/user.api';
import NOTIFICATION_API from '@shared/notification/notification.api';
import CHAT_API from '@shared/chat/chat.api';
import { LOST_API } from '@shared/lost/lost.api';

export const createApi = (userToken?: string) => {
  return {
    auth: createApiService(AUTH_API, userToken, undefined, false),
    car: createApiService(CAR_API, userToken, undefined, 60 * 60),
    file: createApiService(FILE_API, userToken, undefined, false),
    user: createApiService(USER_API, userToken, undefined, false),
    notification: createApiService(NOTIFICATION_API, userToken, undefined, false),
    chat: createApiService(CHAT_API, userToken, undefined, false),
    lost: createApiService(LOST_API, userToken, undefined, false)
  };
};

const api = createApi();

export const authService = api.auth;
export const carService = api.car;
export const fileService = api.file;
export const userService = api.user;
export const notificationService = api.notification;
export const chatService = api.chat;
export const lostService = api.lost;
