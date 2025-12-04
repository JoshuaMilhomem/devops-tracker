import { createFileRoute } from '@tanstack/react-router';

import TrackerView from '@/features/tracker';

export const Route = createFileRoute('/_tracker/')({
  component: TrackerView,
});
