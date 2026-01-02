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

export interface ChartDataPoint {
  date: string;
  fullDate: string;
  wt: number;
  sp: number;
  hours: number;
}

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
      const [year, month] = selectedDate.split('-').map(Number);
      rangeStart = new Date(year, month - 1, 1);
      rangeEnd = new Date(year, month, 0);
      rangeEnd.setHours(23, 59, 59, 999);
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

    const chartData: ChartDataPoint[] = [];
    const iterDate = new Date(rangeStart);

    while (iterDate.getTime() < rangeEnd.getTime()) {
      const dayStart = new Date(iterDate);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(iterDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayStartTs = dayStart.getTime();
      const dayEndTs = dayEnd.getTime();

      let dailyMs = 0;

      tasks.forEach((t) => {
        t.intervals.forEach((i) => {
          const iStart = new Date(i.start).getTime();
          const iEnd = i.end ? new Date(i.end).getTime() : new Date().getTime();

          const start = Math.max(dayStartTs, iStart);
          const end = Math.min(dayEndTs, iEnd);

          if (start < end) {
            dailyMs += end - start;
          }
        });
      });

      chartData.push({
        date: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(
          dayStart
        ),
        fullDate: dayStart.toISOString(),
        wt: parseFloat(calculateWorkUnits(dailyMs)),
        sp: calculateStoryPoints(dailyMs),
        hours: dailyMs / (1000 * 60 * 60),
      });

      iterDate.setDate(iterDate.getDate() + 1);
    }

    return {
      stats: totalStats,
      activities: sortedActivities,
      chartData,
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
