import { createFileRoute } from '@tanstack/react-router';

import HistoryView from '@/features/history';

export const Route = createFileRoute('/history/')({
  component: HistoryView,
});
