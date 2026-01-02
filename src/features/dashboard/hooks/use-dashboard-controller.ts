import { useMemo } from 'react';

import { useNavigate, useSearch } from '@tanstack/react-router';

import { useTaskManager } from '@/hooks/use-task-manager';
import { useViewPersistence } from '@/hooks/use-view-persistence';
import { type WeekDay, getSprintRange } from '@/lib/time-utils';
import { dashboardViewAtom } from '@/store/view-state-atoms';

import { useDashboardStats } from './use-dashboard-stats';

export function useDashboardController() {
  const { tasks } = useTaskManager();

  const search = useSearch({ from: '/dashboard/' });
  const navigate = useNavigate({ from: '/dashboard' });
  useViewPersistence(search, dashboardViewAtom);

  const updateSearch = (newParams: Partial<typeof search>) => {
    navigate({
      search: (prev) => ({ ...prev, ...newParams }),
      replace: true,
    });
  };

  const filter = search.filter ?? 'sprint';
  const selectedDate = search.date ?? new Date().toISOString().split('T')[0];

  const sprintConfig = useMemo(
    () => ({
      startDay: (search.startDay ?? 1) as WeekDay,
      endDay: (search.endDay ?? 5) as WeekDay,
      offset: search.sprintOffset ?? 0,
    }),
    [search.startDay, search.endDay, search.sprintOffset]
  );

  const { stats, activities, chartData } = useDashboardStats(
    tasks,
    filter,
    selectedDate,
    sprintConfig
  );

  const currentSprintRange = getSprintRange(sprintConfig);

  const currentMonthValue = useMemo(() => {
    const [y, m] = selectedDate.split('-');
    return `${y}-${m}-01`;
  }, [selectedDate]);

  const formatDateDisplay = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
  };

  const handleSprintNavigate = (direction: 'prev' | 'next') => {
    updateSearch({
      sprintOffset: sprintConfig.offset + (direction === 'next' ? 1 : -1),
    });
  };

  const monthOptions = useMemo(() => {
    const activeMonths = new Set<string>();

    tasks.forEach((task) => {
      if (task.intervals.length === 0) {
        const created = new Date(task.createdAt);
        const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
        activeMonths.add(key);
        return;
      }

      task.intervals.forEach((interval) => {
        const start = new Date(interval.start);
        const end = interval.end ? new Date(interval.end) : new Date();
        const current = new Date(start.getFullYear(), start.getMonth(), 1);
        const endDate = new Date(end.getFullYear(), end.getMonth(), 1);

        while (current <= endDate) {
          const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
          activeMonths.add(key);
          current.setMonth(current.getMonth() + 1);
        }
      });
    });

    const sortedMonths = Array.from(activeMonths).sort().reverse();

    if (sortedMonths.length === 0) {
      const now = new Date();
      sortedMonths.push(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    }

    return sortedMonths.map((key) => {
      const [year, month] = key.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
        date
      );

      return {
        value: `${key}-01`,
        label: label.charAt(0).toUpperCase() + label.slice(1),
      };
    });
  }, [tasks]);

  return {
    filter,
    selectedDate,
    sprintConfig,
    currentSprintRange,
    currentMonthValue,
    monthOptions,

    stats,
    activities,
    chartData,

    updateSearch,
    handleSprintNavigate,
    formatDateDisplay,
  };
}
