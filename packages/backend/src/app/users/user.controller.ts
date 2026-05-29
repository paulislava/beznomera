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
import { ApiClientAuthGuard } from '../auth/api-auth.guard';

@Controller(USER_API.path)
export class UserController implements UserApi {
  constructor(private readonly userService: UserService) {}

  @Get(USER_API.backendRoutes.me)
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: RequestUser): Promise<UserProfile> {
    return this.userService.getProfile(user.userId);
  }

  @Get(USER_API.backendRoutes.getProfile)
  @UseGuards(ApiClientAuthGuard)
  getProfile(@Param('id', ParseIntPipe) id: number): Promise<UserProfile> {
    return this.userService.getProfile(id);
  }

  @Patch(USER_API.backendRoutes.updateMe)
  @UseGuards(JwtAuthGuard)
  updateMe(
    @Body() data: UserProfileUpdate,
    @CurrentUser() user: RequestUser,
  ): Promise<UserProfile> {
    return this.userService.updateProfile(user.userId, data);
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: RequestUser,
  ): Promise<{ avatarUrl: string }> {
    const avatarUrl = await this.userService.uploadAvatar(user.userId, file);
    return { avatarUrl };
  }

  @Delete(USER_API.backendRoutes.deleteAvatar)
  @UseGuards(JwtAuthGuard)
  deleteAvatar(@CurrentUser() user: RequestUser): Promise<void> {
    return this.userService.deleteAvatar(user.userId);
  }

  @Get(USER_API.backendRoutes.balance)
  @UseGuards(JwtAuthGuard)
  balance(@CurrentUser() user: RequestUser): Promise<UserBalance> {
    return this.userService.getUserBalance(user.userId);
  }

  @Get(USER_API.backendRoutes.transactions)
  @UseGuards(JwtAuthGuard)
  transactions(@CurrentUser() user: RequestUser): Promise<UserTransaction[]> {
    return this.userService.getUserTransactions(user.userId);
  }

  @Get(USER_API.backendRoutes.checkUsername)
  @UseGuards(JwtAuthGuard)
  async checkUsername(@Param('username') username: string): Promise<boolean> {
    const user = await this.userService.findUserByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return true;
  }
}
