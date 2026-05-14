import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  UserBalance,
  UserProfile,
  UserProfileUpdate,
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

  @Get(USER_API.backendRoutes.me)
  me(@CurrentUser() user: RequestUser): Promise<UserProfile> {
    return this.userService.getProfile(user.userId);
  }

  @Get(USER_API.backendRoutes.getProfile)
  getProfile(@Param('id', ParseIntPipe) id: number): Promise<UserProfile> {
    return this.userService.getProfile(id);
  }

  @Patch(USER_API.backendRoutes.updateMe)
  updateMe(
    @Body() data: UserProfileUpdate,
    @CurrentUser() user: RequestUser,
  ): Promise<UserProfile> {
    return this.userService.updateProfile(user.userId, data);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: RequestUser,
  ): Promise<{ avatarUrl: string }> {
    const avatarUrl = await this.userService.uploadAvatar(user.userId, file);
    return { avatarUrl };
  }

  @Delete(USER_API.backendRoutes.deleteAvatar)
  deleteAvatar(@CurrentUser() user: RequestUser): Promise<void> {
    return this.userService.deleteAvatar(user.userId);
  }

  @Get(USER_API.backendRoutes.balance)
  balance(@CurrentUser() user: RequestUser): Promise<UserBalance> {
    return this.userService.getUserBalance(user.userId);
  }

  @Get(USER_API.backendRoutes.transactions)
  transactions(@CurrentUser() user: RequestUser): Promise<UserTransaction[]> {
    return this.userService.getUserTransactions(user.userId);
  }

  @Get(USER_API.backendRoutes.checkUsername)
  async checkUsername(@Param('username') username: string): Promise<boolean> {
    const user = await this.userService.findUserByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return true;
  }
}
