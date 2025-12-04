import { createFileRoute } from '@tanstack/react-router';

import DashboardView from '@/features/dashboard';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardView,
});
