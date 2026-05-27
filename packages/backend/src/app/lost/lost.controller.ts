import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LostApi, LOST_API } from '@paulislava/shared/lost/lost.api';
import { LostItemInfo, LossEventInfo, LossStats } from '@paulislava/shared/lost/lost.types';
import { RequestUser } from '@paulislava/shared/user/user.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../users/user.decorator';
import { CreateLostItemDto, RecordLossDto } from './lost.dto';
import { LostService } from './lost.service';

@Controller(LOST_API.path)
@UseGuards(JwtAuthGuard)
export class LostController implements LostApi {
  constructor(private readonly lostService: LostService) {}

  @Get(LOST_API.backendRoutes.getItems)
  getItems(): Promise<LostItemInfo[]> {
    return this.lostService.getItems();
  }

  @Post(LOST_API.backendRoutes.createItem)
  createItem(
    @Body() dto: CreateLostItemDto,
    @CurrentUser() user: RequestUser,
  ): Promise<LostItemInfo> {
    return this.lostService.createItem(dto.name, user.userId);
  }

  @Get(LOST_API.backendRoutes.getStats)
  getStats(@CurrentUser() user: RequestUser): Promise<LossStats> {
    return this.lostService.getStats(user.userId);
  }

  @Get(LOST_API.backendRoutes.getRecentEvents)
  getRecentEvents(@CurrentUser() user: RequestUser): Promise<LossEventInfo[]> {
    return this.lostService.getRecentEvents(user.userId);
  }

  @Post(LOST_API.backendRoutes.recordLoss)
  recordLoss(
    @Body() dto: RecordLossDto,
    @CurrentUser() user: RequestUser,
  ): Promise<LossEventInfo> {
    return this.lostService.recordLoss(dto.itemId, user.userId);
  }
}
