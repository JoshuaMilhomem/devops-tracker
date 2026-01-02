import { useMemo } from 'react';

import { useNavigate, useSearch } from '@tanstack/react-router';
import {
  ArrowRight,
  CalendarDays,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTaskManager } from '@/hooks/use-task-manager';
import { useViewPersistence } from '@/hooks/use-view-persistence';
import { type WeekDay, getSprintRange } from '@/lib/time-utils';
import { dashboardViewAtom } from '@/store/view-state-atoms';

import { ActivityList } from './components/activity-list';
import { MetricsCards } from './components/metrics-cards';
import { useDashboardStats } from './hooks/use-dashboard-stats';

const DAYS_OPTIONS = [
  { value: '0', label: 'Dom' },
  { value: '1', label: 'Seg' },
  { value: '2', label: 'Ter' },
  { value: '3', label: 'Qua' },
  { value: '4', label: 'Qui' },
  { value: '5', label: 'Sex' },
  { value: '6', label: 'Sáb' },
];

export default function DashboardView() {
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

  const { stats, activities } = useDashboardStats(tasks, filter, selectedDate, sprintConfig);
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

  const handleSprintNavigate = (direction: 'prev' | 'next') => {
    updateSearch({
      sprintOffset: sprintConfig.offset + (direction === 'next' ? 1 : -1),
    });
  };

  const formatDateDisplay = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
  };

  const currentSprintRange = getSprintRange(sprintConfig);
  const currentMonthValue = useMemo(() => {
    const [y, m] = selectedDate.split('-');
    return `${y}-${m}-01`;
  }, [selectedDate]);
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 py-6 px-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <LayoutDashboard className="text-blue-500" /> Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Visão geral de produtividade, métricas e entregas.
          </p>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2 flex flex-col lg:flex-row gap-4 items-center shadow-sm">
        <div className="bg-slate-950 p-1 rounded-lg border border-slate-800/50 flex shrink-0 w-full lg:w-auto">
          {(['sprint', 'day', 'month'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                const today = new Date();
                const defaultDate =
                  f === 'month'
                    ? new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0];

                updateSearch({
                  filter: f,
                  date: defaultDate,
                  ...(f === 'sprint' ? { sprintOffset: 0 } : {}),
                });
              }}
              className={`
                  flex-1 lg:flex-none px-4 py-1.5 text-[11px] uppercase font-bold rounded-md transition-all duration-200
                  ${
                    filter === f
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                  }
                `}
            >
              {f === 'day' ? 'Dia' : f === 'sprint' ? 'Sprint' : 'Mês'}
            </button>
          ))}
        </div>

        <div className="hidden lg:block w-px h-8 bg-slate-800 mx-2" />

        <div className="flex-1 w-full lg:w-auto flex justify-center lg:justify-start">
          {filter === 'day' && (
            <div className="relative w-full lg:max-w-[200px] animate-in zoom-in-95 duration-200">
              <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => updateSearch({ date: e.target.value })}
                className="pl-9 bg-slate-950 border-slate-700 h-9 text-sm w-full"
              />
            </div>
          )}

          {filter === 'sprint' && (
            <div className="flex flex-wrap items-center gap-2 animate-in zoom-in-95 duration-200 w-full lg:w-auto justify-center lg:justify-start">
              <div className="flex items-center bg-slate-950 rounded-md border border-slate-800 p-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded hover:bg-slate-900"
                  onClick={() => handleSprintNavigate('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-xs font-mono text-slate-300 min-w-[100px] text-center">
                  {formatDateDisplay(currentSprintRange.start)} -{' '}
                  {formatDateDisplay(currentSprintRange.end)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded hover:bg-slate-900"
                  onClick={() => handleSprintNavigate('next')}
                  disabled={sprintConfig.offset >= 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-1 bg-slate-950 rounded-md border border-slate-800 p-1 px-2 h-9">
                <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Ciclo:</span>
                <Select
                  value={String(sprintConfig.startDay)}
                  onValueChange={(v) => updateSearch({ startDay: Number(v) })}
                >
                  <SelectTrigger className="h-6 w-[50px] text-xs bg-transparent border-none p-0 focus:ring-0 text-blue-400 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OPTIONS.map((d) => (
                      <SelectItem key={`start-${d.value}`} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <ArrowRight className="w-3 h-3 text-slate-600" />

                <Select
                  value={String(sprintConfig.endDay)}
                  onValueChange={(v) => updateSearch({ endDay: Number(v) })}
                >
                  <SelectTrigger className="h-6 w-[50px] text-xs bg-transparent border-none p-0 focus:ring-0 text-blue-400 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OPTIONS.map((d) => (
                      <SelectItem key={`end-${d.value}`} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {filter === 'month' && (
            <div className="flex items-center gap-2 animate-in zoom-in-95 duration-200 w-full lg:w-auto">
              <Select value={currentMonthValue} onValueChange={(v) => updateSearch({ date: v })}>
                <SelectTrigger className="w-full lg:w-[240px] bg-slate-950 border-slate-700 h-9 text-sm focus:ring-0">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-500" />
                    <SelectValue placeholder="Selecione o mês" />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <MetricsCards stats={stats} />
      <ActivityList activities={activities} currentFilter={filter} />
    </div>
  );
}
