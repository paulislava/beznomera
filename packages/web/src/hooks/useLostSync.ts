'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LostItemInfo, LossStats } from '@shared/lost/lost.types';
import { lostService } from '@/services';

const QUEUE_KEY = 'lost_queue';
const ITEMS_CACHE_KEY = 'lost_items_cache';

interface QueueItem {
  itemId: number;
  timestamp: string;
}

function readQueue(): QueueItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function readItemsCache(fallback: LostItemInfo[]): LostItemInfo[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const cached = localStorage.getItem(ITEMS_CACHE_KEY);
    return cached ? JSON.parse(cached) : fallback;
  } catch {
    return fallback;
  }
}

export function useLostSync(initialStats: LossStats, initialItems: LostItemInfo[]) {
  const [serverStats, setServerStats] = useState<LossStats>(initialStats);
  const [items, setItems] = useState<LostItemInfo[]>(() => readItemsCache(initialItems));
  const [queue, setQueue] = useState<QueueItem[]>(readQueue);
  const [isOnline, setIsOnline] = useState(true);
  const isOnlineRef = useRef(true);

  const updateQueue = useCallback((q: QueueItem[]) => {
    setQueue(q);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  }, []);

  const stats = useMemo((): LossStats => {
    const now = Date.now();
    const todayExtra = queue.filter(q => now - +new Date(q.timestamp) < 86_400_000).length;
    const weekExtra = queue.filter(q => now - +new Date(q.timestamp) < 604_800_000).length;
    return {
      total: serverStats.total + queue.length,
      today: serverStats.today + todayExtra,
      week: serverStats.week + weekExtra
    };
  }, [serverStats, queue]);

  const refreshStats = useCallback(async () => {
    try {
      const fresh = await lostService.getStats();
      setServerStats(fresh);
    } catch {}
  }, []);

  const drainQueue = useCallback(
    async (currentQueue: QueueItem[]) => {
      if (!currentQueue.length) return;
      const remaining = [...currentQueue];
      for (let i = 0; i < remaining.length; ) {
        try {
          await lostService.recordLoss({ itemId: remaining[i].itemId });
          remaining.splice(i, 1);
        } catch {
          break;
        }
      }
      updateQueue(remaining);
      if (!remaining.length) await refreshStats();
    },
    [updateQueue, refreshStats]
  );

  useEffect(() => {
    const online = navigator.onLine;
    setIsOnline(online);
    isOnlineRef.current = online;

    const onOnline = () => {
      setIsOnline(true);
      isOnlineRef.current = true;
      drainQueue(readQueue());
    };
    const onOffline = () => {
      setIsOnline(false);
      isOnlineRef.current = false;
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    if (online) drainQueue(readQueue());

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [drainQueue]);

  useEffect(() => {
    localStorage.setItem(ITEMS_CACHE_KEY, JSON.stringify(items));
  }, [items]);

  const recordLoss = useCallback(
    async (itemId: number) => {
      const entry: QueueItem = { itemId, timestamp: new Date().toISOString() };
      const newQueue = [...queue, entry];
      updateQueue(newQueue);
      if (isOnlineRef.current) await drainQueue(newQueue);
    },
    [queue, updateQueue, drainQueue]
  );

  const addItem = useCallback(async (name: string): Promise<LostItemInfo> => {
    const item = await lostService.createItem({ name });
    setItems(prev => [...prev, item].sort((a, b) => a.name.localeCompare(b.name, 'ru')));
    return item;
  }, []);

  return { stats, items, recordLoss, addItem, isOnline };
}
