import { APIRoutes, apiInfo } from '../api-routes';
import { LostItemInfo, LossEventInfo, LossStats, LostShortcutInfo } from './lost.types';

export interface LostApi {
  getItems(...args: any[]): Promise<LostItemInfo[]>;
  createItem(body: { name: string }, ...args: any[]): Promise<LostItemInfo>;
  getStats(...args: any[]): Promise<LossStats>;
  getRecentEvents(...args: any[]): Promise<LossEventInfo[]>;
  recordLoss(body: { itemId: number }, ...args: any[]): Promise<LossEventInfo>;
  getOrCreateShortcut(body: { itemId: number }, ...args: any[]): Promise<LostShortcutInfo>;
}

const LOST_ROUTES: APIRoutes<LostApi> = {
  getItems: 'items',
  createItem: { path: 'items', method: 'POST' },
  getStats: 'stats',
  getRecentEvents: 'events',
  recordLoss: { path: 'record', method: 'POST' },
  getOrCreateShortcut: { path: 'shortcut', method: 'POST' }
};

export const LOST_API = apiInfo(LOST_ROUTES, 'lost');
