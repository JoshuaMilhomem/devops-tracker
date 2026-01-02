import { atomWithStorage } from 'jotai/utils';

export type DecimalSeparator = 'system' | 'dot' | 'comma';
export type SyncMode = 'manual' | 'automatic';
export const decimalSeparatorAtom = atomWithStorage<DecimalSeparator>(
  'devops-separator-pref',
  'system'
);
export const syncModeAtom = atomWithStorage<SyncMode>('devops-sync-mode', 'manual');
