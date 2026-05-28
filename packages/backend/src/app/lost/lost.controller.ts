import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LostApi, LOST_API } from '@paulislava/shared/lost/lost.api';
import {
  LostItemInfo,
  LossEventInfo,
  LossStats,
  LostShortcutInfo,
  LostItemStats,
} from '@paulislava/shared/lost/lost.types';
import { RequestUser } from '@paulislava/shared/user/user.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../users/user.decorator';
import {
  CreateLostItemDto,
  GetOrCreateShortcutDto,
  RecordLossDto,
} from './lost.dto';
import { LostService } from './lost.service';

@Controller(LOST_API.path)
export class LostController implements LostApi {
  constructor(private readonly lostService: LostService) {}

  @Get(LOST_API.backendRoutes.getItems)
  @UseGuards(JwtAuthGuard)
  getItems(): Promise<LostItemInfo[]> {
    return this.lostService.getItems();
  }

  @Post(LOST_API.backendRoutes.createItem)
  @UseGuards(JwtAuthGuard)
  createItem(
    @Body() dto: CreateLostItemDto,
    @CurrentUser() user: RequestUser,
  ): Promise<LostItemInfo> {
    return this.lostService.createItem(dto.name, user.userId);
  }

  @Get(LOST_API.backendRoutes.getStats)
  @UseGuards(JwtAuthGuard)
  getStats(@CurrentUser() user: RequestUser): Promise<LossStats> {
    return this.lostService.getStats(user.userId);
  }

  @Get(LOST_API.backendRoutes.getItemStats)
  @UseGuards(JwtAuthGuard)
  getItemStats(@CurrentUser() user: RequestUser): Promise<LostItemStats[]> {
    return this.lostService.getItemStats(user.userId);
  }

  @Get(LOST_API.backendRoutes.getRecentEvents)
  @UseGuards(JwtAuthGuard)
  getRecentEvents(@CurrentUser() user: RequestUser): Promise<LossEventInfo[]> {
    return this.lostService.getRecentEvents(user.userId);
  }

  @Post(LOST_API.backendRoutes.recordLoss)
  @UseGuards(JwtAuthGuard)
  recordLoss(
    @Body() dto: RecordLossDto,
    @CurrentUser() user: RequestUser,
  ): Promise<LossEventInfo> {
    return this.lostService.recordLoss(dto.itemId, user.userId);
  }

  @Post(LOST_API.backendRoutes.getOrCreateShortcut)
  @UseGuards(JwtAuthGuard)
  getOrCreateShortcut(
    @Body() dto: GetOrCreateShortcutDto,
    @CurrentUser() user: RequestUser,
  ): Promise<LostShortcutInfo> {
    return this.lostService.getOrCreateShortcut(user.userId, dto.itemId);
  }

  @Get('shortcut/:token')
  async triggerShortcut(@Param('token') token: string): Promise<void> {
    await this.lostService.triggerShortcut(token);
  }
}
