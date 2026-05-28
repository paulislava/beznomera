export interface LostItemInfo {
  id: number;
  name: string;
  isDefault: boolean;
}

export interface LossEventInfo {
  id: number;
  itemId: number;
  itemName: string;
  createdAt: string;
}

export interface LossStats {
  total: number;
  today: number;
  week: number;
}

export interface LostShortcutInfo {
  token: string;
  itemName: string;
}

export interface LostItemStats {
  itemId: number;
  name: string;
  total: number;
  today: number;
  week: number;
}
