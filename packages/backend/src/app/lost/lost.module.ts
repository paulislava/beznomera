import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LostItem } from '../entities/lost/lost-item.entity';
import { LossEvent } from '../entities/lost/loss-event.entity';
import { LostShortcutToken } from '../entities/lost/lost-shortcut-token.entity';
import { LostController } from './lost.controller';
import { LostService } from './lost.service';

@Module({
  imports: [TypeOrmModule.forFeature([LostItem, LossEvent, LostShortcutToken])],
  controllers: [LostController],
  providers: [LostService],
})
export class LostModule {}
