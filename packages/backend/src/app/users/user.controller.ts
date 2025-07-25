import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  UserBalance,
  UserTransaction,
} from '@paulislava/shared/user/user.types';
import { UserApi, USER_API } from '@paulislava/shared/user/user.api';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { CurrentUser } from './user.decorator';
import { UserService } from './user.service';
import { RequestUser } from '@paulislava/shared/user/user.types';

@Controller(USER_API.path)
@UseGuards(JwtAuthGuard)
export class UserController implements UserApi {
  constructor(private readonly userService: UserService) {}

  @Get(USER_API.backendRoutes.balance)
  balance(@CurrentUser() user: RequestUser): Promise<UserBalance> {
    return this.userService.getUserBalance(user.userId);
  }

  @Get(USER_API.backendRoutes.transactions)
  transactions(@CurrentUser() user: RequestUser): Promise<UserTransaction[]> {
    return this.userService.getUserTransactions(user.userId);
  }
}
