import { atom } from 'jotai';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

export const syncStatusAtom = atom<SyncStatus>('idle');
export const lastSyncTimeAtom = atom<Date | null>(null);
