import z from 'zod';

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
  updatedAt?: string;
  completedAt?: string;
}

const taskSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  tags: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      color: z.string(),
    })
  ),
  status: z.enum(['idle', 'running', 'paused', 'completed']),
  intervals: z.array(
    z.object({
      id: z.string(),
      start: z.string(),
      end: z.string().nullable(),
    })
  ),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  completedAt: z.string().optional(),
});

export const backupSchema = z.array(taskSchema);
