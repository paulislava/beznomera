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
