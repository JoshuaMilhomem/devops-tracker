export type TaskStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface TimeInterval {
  id: string;
  start: string;
  end: string | null;
}

export interface Tag {
  id: string;
  label: string;
  color: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  tags: Tag[];
  status: TaskStatus;
  intervals: TimeInterval[];
  createdAt: string;
  completedAt?: string;
}
