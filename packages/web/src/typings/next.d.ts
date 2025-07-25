import { RequestUser } from '../../../shared/src/user/user.types';

declare module 'next/server' {
  interface NextRequest {
    user?: RequestUser;
  }
}
