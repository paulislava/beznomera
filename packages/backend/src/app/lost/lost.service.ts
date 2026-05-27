import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LostItemInfo,
  LossEventInfo,
  LossStats,
  LostShortcutInfo,
  LostItemStats,
} from '@paulislava/shared/lost/lost.types';
import { MoreThan, Repository } from 'typeorm';
import { LostItem } from '../entities/lost/lost-item.entity';
import { LossEvent } from '../entities/lost/loss-event.entity';
import { LostShortcutToken } from '../entities/lost/lost-shortcut-token.entity';

@Injectable()
export class LostService {
  constructor(
    @InjectRepository(LostItem)
    private readonly itemRepo: Repository<LostItem>,
    @InjectRepository(LossEvent)
    private readonly eventRepo: Repository<LossEvent>,
    @InjectRepository(LostShortcutToken)
    private readonly shortcutRepo: Repository<LostShortcutToken>,
  ) {}

  async getItems(): Promise<LostItemInfo[]> {
    const items = await this.itemRepo.find({ order: { name: 'ASC' } });
    return items.map((item) => ({
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

  async getItemStats(userId: number): Promise<LostItemStats[]> {
    const events = await this.eventRepo.find({
      where: { userId },
      relations: ['item'],
    });
    const now = Date.now();
    const map = new Map<number, LostItemStats>();
    for (const e of events) {
      const s = map.get(e.itemId) ?? {
        itemId: e.itemId,
        name: e.item.name,
        total: 0,
        today: 0,
        week: 0,
      };
      const age = now - e.createdAt.getTime();
      s.total++;
      if (age < 86_400_000) s.today++;
      if (age < 604_800_000) s.week++;
      map.set(e.itemId, s);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }

  async getRecentEvents(userId: number): Promise<LossEventInfo[]> {
    const events = await this.eventRepo.find({
      where: { userId },
      relations: ['item'],
      order: { createdAt: 'DESC' },
      take: 20,
    });
    return events.map((e) => ({
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

  async getOrCreateShortcut(
    userId: number,
    itemId: number,
  ): Promise<LostShortcutInfo> {
    const item = await this.itemRepo.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Предмет не найден');

    let shortcut = await this.shortcutRepo.findOne({
      where: { userId, itemId },
    });
    if (!shortcut) {
      shortcut = this.shortcutRepo.create({ userId, itemId });
      await shortcut.save();
    }

    return { token: shortcut.token, itemName: item.name };
  }

  async triggerShortcut(token: string): Promise<void> {
    const shortcut = await this.shortcutRepo.findOne({ where: { token } });
    if (!shortcut) throw new NotFoundException('Токен не найден');
    await this.recordLoss(shortcut.itemId, shortcut.userId);
  }

  async getOrCreateShortcutByToken(token: string): Promise<LostShortcutInfo> {
    const shortcut = await this.shortcutRepo.findOne({
      where: { token },
      relations: ['item'],
    });
    if (!shortcut) throw new NotFoundException('Токен не найден');
    return { token: shortcut.token, itemName: shortcut.item.name };
  }

  generateShortcutFile(
    token: string,
    itemName: string,
    baseUrl: string,
  ): string {
    const triggerUrl = `${baseUrl}/api/lost/shortcut/${token}`;
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>WFWorkflowClientRelease</key><string>2.0</string>
  <key>WFWorkflowClientVersion</key><string>2190</string>
  <key>WFWorkflowMinimumClientVersion</key><integer>900</integer>
  <key>WFWorkflowName</key><string>Я забыла ${itemName}</string>
  <key>WFWorkflowIcon</key>
  <dict>
    <key>WFWorkflowIconGlyphNumber</key><integer>59499</integer>
    <key>WFWorkflowIconStartColor</key><integer>4274264319</integer>
  </dict>
  <key>WFWorkflowImportQuestions</key><array/>
  <key>WFWorkflowInputContentItemClasses</key><array/>
  <key>WFWorkflowTypes</key>
  <array><string>WatchKit</string></array>
  <key>WFWorkflowActions</key>
  <array>
    <dict>
      <key>WFWorkflowActionIdentifier</key>
      <string>is.workflow.actions.downloadurl</string>
      <key>WFWorkflowActionParameters</key>
      <dict>
        <key>WFHTTPMethod</key><string>GET</string>
        <key>WFURL</key><string>${triggerUrl}</string>
      </dict>
    </dict>
  </array>
</dict>
</plist>`;
  }
}
