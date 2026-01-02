import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import DashboardView from '@/features/dashboard';

const dashboardSearchSchema = z.object({
  filter: z.enum(['day', 'sprint', 'month']).default('sprint').optional(),
  date: z.string().optional(),
  sprintOffset: z.number().default(0).optional(),
  startDay: z.number().min(0).max(6).optional(),
  endDay: z.number().min(0).max(6).optional(),
});

export const Route = createFileRoute('/dashboard/')({
  validateSearch: (search) => dashboardSearchSchema.parse(search),
  component: DashboardView,
});
