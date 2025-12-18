import { useMemo } from 'react';

import { calculateStoryPoints, calculateWorkUnits } from '@/lib/time-utils';
import type { Task } from '@/types';

export type DashboardFilter = 'day' | 'sprint' | 'month';

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DashboardActivity extends Task {
  durationInPeriod: number;
}

interface SprintConfig {
  startDay: WeekDay;
  endDay: WeekDay;
  offset: number;
}

/**
 * Retorna a data do último dia da semana especificado (startDay)
 * relativo à data de referência.
 */
const getSprintStart = (date: Date, startDay: WeekDay): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const currentDay = result.getDay();

  const diff = (currentDay - startDay + 7) % 7;
  result.setDate(result.getDate() - diff);
  return result;
};

export function useDashboardStats(
  tasks: Task[],
  filter: DashboardFilter,
  selectedDate: string,
  sprintConfig: SprintConfig
) {
  return useMemo(() => {
    let rangeStart: Date;
    let rangeEnd: Date;
    const today = new Date();

    if (filter === 'day') {
      const [year, month, day] = selectedDate.split('-').map(Number);
      rangeStart = new Date(year, month - 1, day);
      rangeEnd = new Date(year, month - 1, day + 1);
    } else if (filter === 'month') {
      rangeStart = new Date(today.getFullYear(), today.getMonth(), 1);
      rangeEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else {
      const currentSprintStart = getSprintStart(today, sprintConfig.startDay);

      rangeStart = new Date(currentSprintStart);
      rangeStart.setDate(rangeStart.getDate() + sprintConfig.offset * 7);

      rangeEnd = new Date(rangeStart);

      const durationDays = (sprintConfig.endDay - sprintConfig.startDay + 7) % 7;

      rangeEnd.setDate(rangeEnd.getDate() + durationDays);

      rangeEnd.setDate(rangeEnd.getDate() + 1);
      rangeEnd.setHours(0, 0, 0, 0);
    }

    const startTs = rangeStart.getTime();
    const endTs = rangeEnd.getTime();

    const computedActivities = tasks
      .map((t) => {
        let duration = 0;
        let hasActivityInPeriod = false;

        t.intervals.forEach((i) => {
          const iStart = new Date(i.start).getTime();
          const iEnd = i.end ? new Date(i.end).getTime() : new Date().getTime();

          const overlapStart = Math.max(startTs, iStart);
          const overlapEnd = Math.min(endTs, iEnd);

          if (overlapStart < overlapEnd) {
            duration += overlapEnd - overlapStart;
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
        sp: acc.sp + calculateStoryPoints(curr.durationInPeriod),
      }),
      { hours: 0, wt: 0, sp: 0 }
    );
    const sortedActivities = computedActivities.sort(
      (a, b) => b.durationInPeriod - a.durationInPeriod
    );

    return {
      stats: totalStats,
      activities: sortedActivities,
      periodLabel: {
        start: rangeStart,

        end: new Date(rangeEnd.getTime() - 1000),
      },
    };
  }, [
    tasks,
    filter,
    selectedDate,
    sprintConfig.startDay,
    sprintConfig.endDay,
    sprintConfig.offset,
  ]);
}
