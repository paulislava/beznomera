import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../users/user.decorator';
import { RequestUser } from '@paulislava/shared/user/user.types';
import NOTIFICATION_API from '@paulislava/shared/notification/notification.api';
import { PushSubscribeBody, PushUnsubscribeBody } from '@paulislava/shared/notification/notification.types';

class PushKeysDto {
  @IsString()
  p256dh: string;

  @IsString()
  auth: string;
}

class SubscribeDto implements PushSubscribeBody {
  @IsString()
  endpoint: string;

  @ValidateNested()
  @Type(() => PushKeysDto)
  keys: PushKeysDto;
}

class UnsubscribeDto implements PushUnsubscribeBody {
  @IsString()
  endpoint: string;
}

@Controller(NOTIFICATION_API.path)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get(NOTIFICATION_API.backendRoutes.vapidPublicKey)
  vapidPublicKey(): { publicKey: string } {
    return { publicKey: this.notificationService.getVapidPublicKey() };
  }

  @Post(NOTIFICATION_API.backendRoutes.subscribe)
  @UseGuards(JwtAuthGuard)
  async subscribe(
    @Body() body: SubscribeDto,
    @CurrentUser() user: RequestUser,
  ): Promise<void> {
    await this.notificationService.subscribe(
      user.userId,
      body.endpoint,
      body.keys.p256dh,
      body.keys.auth,
    );
  }

  @Post(NOTIFICATION_API.backendRoutes.unsubscribe)
  @UseGuards(JwtAuthGuard)
  async unsubscribe(
    @Body() body: UnsubscribeDto,
    @CurrentUser() user: RequestUser,
  ): Promise<void> {
    await this.notificationService.unsubscribe(user.userId, body.endpoint);
  }
}
