import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import type { Task } from '@/types';

export const tasksAtom = atomWithStorage<Task[]>('devops-tasks-v1', []);

export const activeTaskAtom = atom((get) => {
  const tasks = get(tasksAtom);
  return tasks.find((t) => t.status === 'running') || null;
});
