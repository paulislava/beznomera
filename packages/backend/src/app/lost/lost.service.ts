import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LostItemInfo,
  LossEventInfo,
  LossStats,
} from '@paulislava/shared/lost/lost.types';
import { MoreThan, Repository } from 'typeorm';
import { LostItem } from '../entities/lost/lost-item.entity';
import { LossEvent } from '../entities/lost/loss-event.entity';

@Injectable()
export class LostService {
  constructor(
    @InjectRepository(LostItem)
    private readonly itemRepo: Repository<LostItem>,
    @InjectRepository(LossEvent)
    private readonly eventRepo: Repository<LossEvent>,
  ) {}

  async getItems(): Promise<LostItemInfo[]> {
    const items = await this.itemRepo.find({ order: { name: 'ASC' } });
    return items.map(item => ({
      id: item.id,
      name: item.name,
      isDefault: item.isDefault,
    }));
  }

  async createItem(name: string, userId: number): Promise<LostItemInfo> {
    const existing = await this.itemRepo.findOne({ where: { name } });
    if (existing) {
      throw new ConflictException('Предмет с таким именем уже существует');
    }
    const item = this.itemRepo.create({
      name,
      isDefault: false,
      createdById: userId,
    });
    await item.save();
    return { id: item.id, name: item.name, isDefault: item.isDefault };
  }

  async getStats(userId: number): Promise<LossStats> {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [total, today, week] = await Promise.all([
      this.eventRepo.count({ where: { userId } }),
      this.eventRepo.count({ where: { userId, createdAt: MoreThan(dayAgo) } }),
      this.eventRepo.count({ where: { userId, createdAt: MoreThan(weekAgo) } }),
    ]);

    return { total, today, week };
  }

  async getRecentEvents(userId: number): Promise<LossEventInfo[]> {
    const events = await this.eventRepo.find({
      where: { userId },
      relations: ['item'],
      order: { createdAt: 'DESC' },
      take: 20,
    });
    return events.map(e => ({
      id: e.id,
      itemId: e.itemId,
      itemName: e.item.name,
      createdAt: e.createdAt.toISOString(),
    }));
  }

  async recordLoss(itemId: number, userId: number): Promise<LossEventInfo> {
    const item = await this.itemRepo.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Предмет не найден');

    const event = this.eventRepo.create({ itemId, userId });
    await event.save();

    return {
      id: event.id,
      itemId: event.itemId,
      itemName: item.name,
      createdAt: event.createdAt.toISOString(),
    };
  }
}
