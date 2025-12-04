import { useMemo } from 'react';

import { calculateWorkUnits } from '@/lib/time-utils';
import type { Task } from '@/types';

export type DashboardFilter = 'day' | 'week' | 'month';

export interface DashboardActivity extends Task {
  durationInPeriod: number;
}

export function useDashboardStats(tasks: Task[], filter: DashboardFilter, selectedDate: string) {
  return useMemo(() => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const selDateStart = new Date(year, month - 1, day);
    const selDateEnd = new Date(year, month - 1, day + 1);
    const today = new Date();

    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    const matchesFilter = (startDate: Date) => {
      if (filter === 'day') {
        return startDate >= selDateStart && startDate < selDateEnd;
      }
      if (filter === 'month') {
        return (
          startDate.getMonth() === today.getMonth() &&
          startDate.getFullYear() === today.getFullYear()
        );
      }
      if (filter === 'week') {
        return startDate >= oneWeekAgo;
      }
      return false;
    };

    const computedActivities = tasks
      .map((t) => {
        let duration = 0;
        let hasActivityInPeriod = false;

        t.intervals.forEach((i) => {
          const start = new Date(i.start);
          const end = i.end ? new Date(i.end) : new Date();

          if (matchesFilter(start)) {
            duration += end.getTime() - start.getTime();
            hasActivityInPeriod = true;
          }
        });

        return {
          ...t,
          durationInPeriod: duration,
          hasActivityInPeriod,
        };
      })
      .filter((t) => t.hasActivityInPeriod) as DashboardActivity[];

    const totalStats = computedActivities.reduce(
      (acc, curr) => ({
        hours: acc.hours + curr.durationInPeriod,
        wt: acc.wt + parseFloat(calculateWorkUnits(curr.durationInPeriod)),
        sp: acc.sp + curr.storyPoints,
      }),
      { hours: 0, wt: 0, sp: 0 }
    );

    const sortedActivities = computedActivities.sort(
      (a, b) => b.durationInPeriod - a.durationInPeriod
    );

    return { stats: totalStats, activities: sortedActivities };
  }, [tasks, filter, selectedDate]);
}
