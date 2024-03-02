import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  UserBalance,
  UserTransaction,
} from '@paulislava/shared/user/user.types';
import {
  UserApi,
  USER_CONTROLLER_PATH,
  USER_ROUTES,
} from '@paulislava/shared/user/user.api';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { CurrentUser } from './user.decorator';
import { UserService } from './user.service';
import { RequestUser } from './user.types';

@Controller(USER_CONTROLLER_PATH)
@UseGuards(JwtAuthGuard)
export class UserController implements UserApi {
  constructor(private readonly userService: UserService) {}

  @Get(USER_ROUTES.balance())
  balance(@CurrentUser() user: RequestUser): Promise<UserBalance> {
    return this.userService.getUserBalance(user.userId);
  }

  @Get(USER_ROUTES.transactions())
  transactions(@CurrentUser() user: RequestUser): Promise<UserTransaction[]> {
    return this.userService.getUserTransactions(user.userId);
  }
}
