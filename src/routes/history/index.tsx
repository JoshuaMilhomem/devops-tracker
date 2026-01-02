import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import HistoryView from '@/features/history';

const historySearchSchema = z.object({
  mode: z.enum(['all', 'day', 'sprint', 'range']).default('sprint').optional(),

  status: z.enum(['all', 'completed', 'active']).default('all').optional(),

  date: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),

  sprintOffset: z.number().default(0).optional(),
  sprintStartDay: z.number().default(1).optional(),
  sprintEndDay: z.number().default(5).optional(),
});

export const Route = createFileRoute('/history/')({
  validateSearch: (search) => historySearchSchema.parse(search),
  component: HistoryView,
});
