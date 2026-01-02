import { atomWithStorage } from 'jotai/utils';

export const dashboardViewAtom = atomWithStorage<any>('view-state-dashboard', null);

export const historyViewAtom = atomWithStorage<any>('view-state-history', null);
