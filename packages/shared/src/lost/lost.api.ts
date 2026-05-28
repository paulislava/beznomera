import { APIRoutes, apiInfo } from '../api-routes';
import {
  LostItemInfo,
  LossEventInfo,
  LossStats,
  LostShortcutInfo,
  LostItemStats
} from './lost.types';

export const LOST_USER_ID_PARAM = 'userId';

export interface LostApi {
  getItems(...args: any[]): Promise<LostItemInfo[]>;
  createItem(body: { name: string }, ...args: any[]): Promise<LostItemInfo>;
  getStats(...args: any[]): Promise<LossStats>;
  getStatsForUser(userId: number, ...args: any[]): Promise<LossStats>;
  getItemStats(...args: any[]): Promise<LostItemStats[]>;
  getItemStatsForUser(userId: number, ...args: any[]): Promise<LostItemStats[]>;
  getRecentEvents(...args: any[]): Promise<LossEventInfo[]>;
  recordLoss(body: { itemId: number }, ...args: any[]): Promise<LossEventInfo>;
  getOrCreateShortcut(body: { itemId: number }, ...args: any[]): Promise<LostShortcutInfo>;
}

const LOST_ROUTES: APIRoutes<LostApi> = {
  getItems: 'items',
  createItem: { path: 'items', method: 'POST' },
  getStats: 'stats',
  getStatsForUser: (userId) => `stats/user/${userId || `:${LOST_USER_ID_PARAM}`}`,
  getItemStats: 'stats/items',
  getItemStatsForUser: (userId) => `stats/items/user/${userId || `:${LOST_USER_ID_PARAM}`}`,
  getRecentEvents: 'events',
  recordLoss: { path: 'record', method: 'POST' },
  getOrCreateShortcut: { path: 'shortcut', method: 'POST' }
};

export const LOST_API = apiInfo(LOST_ROUTES, 'lost');
