import { useMemo } from 'react';

import { useNavigate, useSearch } from '@tanstack/react-router';

import { useTaskManager } from '@/hooks/use-task-manager';
import { useViewPersistence } from '@/hooks/use-view-persistence';
import { type WeekDay, getSprintRange, parseDateParam } from '@/lib/time-utils';
import { historyViewAtom } from '@/store/view-state-atoms';
import type { Task } from '@/types';

const isIntervalInPeriod = (task: Task, start: Date, end: Date) => {
  if (!task.intervals || task.intervals.length === 0) {
    const created = new Date(task.createdAt);
    return created >= start && created <= end;
  }

  const periodStart = start.getTime();
  const periodEnd = end.getTime();

  return task.intervals.some((interval) => {
    const iStart = new Date(interval.start).getTime();
    const iEnd = interval.end ? new Date(interval.end).getTime() : Date.now();
    return iStart <= periodEnd && iEnd >= periodStart;
  });
};

export function useHistoryController() {
  const taskManager = useTaskManager();
  const { tasks } = taskManager;

  const search = useSearch({ from: '/history/' });
  const navigate = useNavigate({ from: '/history' });
  useViewPersistence(search, historyViewAtom);

  const updateSearch = (newParams: Partial<typeof search>) => {
    navigate({
      search: (prev) => ({ ...prev, ...newParams }),
      replace: true,
    });
  };

  const mode = search.mode ?? 'sprint';
  const statusFilter = search.status ?? 'all';
  const selectedDate = search.date ?? new Date().toISOString().split('T')[0];
  const rangeFrom = search.from ? parseDateParam(search.from) : undefined;
  const rangeTo = search.to ? parseDateParam(search.to) : undefined;

  const sprintConfig = useMemo(
    () => ({
      startDay: (search.sprintStartDay ?? 1) as WeekDay,
      endDay: (search.sprintEndDay ?? 5) as WeekDay,
      offset: search.sprintOffset ?? 0,
    }),
    [search.sprintStartDay, search.sprintEndDay, search.sprintOffset]
  );

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (statusFilter === 'completed') {
      result = result.filter((t) => t.status === 'completed');
    } else if (statusFilter === 'active') {
      result = result.filter((t) => t.status !== 'completed');
    }

    let startFilter: Date;
    let endFilter: Date;

    if (mode === 'day') {
      startFilter = parseDateParam(selectedDate);
      endFilter = new Date(startFilter);
      endFilter.setHours(23, 59, 59, 999);
    } else if (mode === 'sprint') {
      const range = getSprintRange(sprintConfig);
      startFilter = range.start;
      endFilter = range.end;
    } else if (mode === 'range') {
      startFilter = rangeFrom || new Date(0);
      endFilter = rangeTo || new Date(8640000000000000);
      endFilter.setHours(23, 59, 59, 999);
    } else {
      return result.sort((a, b) => {
        const getLastActivity = (t: Task) => {
          if (t.intervals.length === 0) return new Date(t.createdAt).getTime();
          const last = t.intervals[t.intervals.length - 1];
          return last.end ? new Date(last.end).getTime() : Date.now();
        };
        return getLastActivity(b) - getLastActivity(a);
      });
    }

    result = result.filter((t) => isIntervalInPeriod(t, startFilter, endFilter));

    return result.sort((a, b) => {
      const getLastActivity = (t: Task) => {
        if (t.intervals.length === 0) return new Date(t.createdAt).getTime();
        const last = t.intervals[t.intervals.length - 1];
        return last.end ? new Date(last.end).getTime() : Date.now();
      };
      return getLastActivity(b) - getLastActivity(a);
    });
  }, [tasks, statusFilter, mode, selectedDate, sprintConfig, rangeFrom, rangeTo]);

  const availableTags = useMemo(() => {
    const tagsMap = new Map<string, any>();
    tasks.forEach((t) => t.tags?.forEach((tag) => tagsMap.set(tag.label, tag)));
    return Array.from(tagsMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [tasks]);

  const handleSprintNavigate = (direction: 'prev' | 'next') => {
    updateSearch({ sprintOffset: sprintConfig.offset + (direction === 'next' ? 1 : -1) });
  };

  const formatDateDisplay = (date: Date) =>
    new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);

  const currentSprintRange = getSprintRange(sprintConfig);

  return {
    mode,
    statusFilter,
    selectedDate,
    rangeFrom,
    rangeTo,
    sprintConfig,
    currentSprintRange,

    filteredTasks,
    availableTags,

    updateSearch,
    handleSprintNavigate,
    formatDateDisplay,

    ...taskManager,
  };
}
