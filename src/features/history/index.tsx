import { useMemo, useState } from 'react';

import { useNavigate, useSearch } from '@tanstack/react-router';
import {
  ArrowRight,
  Calendar as CalendarIcon,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  ListFilter,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTaskManager } from '@/hooks/use-task-manager';
import { useViewPersistence } from '@/hooks/use-view-persistence';
import { type WeekDay, getSprintRange, parseDateParam } from '@/lib/time-utils';
import { historyViewAtom } from '@/store/view-state-atoms';
import type { Tag, Task } from '@/types';

import { EditTaskModal, LogEditorModal } from '../../components/shared/task-modals';
import { HistoryItem } from './components/history-item';

const DAYS_OPTIONS = [
  { value: '0', label: 'Dom' },
  { value: '1', label: 'Seg' },
  { value: '2', label: 'Ter' },
  { value: '3', label: 'Qua' },
  { value: '4', label: 'Qui' },
  { value: '5', label: 'Sex' },
  { value: '6', label: 'Sáb' },
];

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

export default function HistoryView() {
  const {
    tasks,
    reopenTask,
    deleteTask,
    updateTaskDetails,
    addManualInterval,
    deleteInterval,
    updateInterval,
  } = useTaskManager();

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

  const sprintConfig = useMemo(
    () => ({
      startDay: (search.sprintStartDay ?? 1) as WeekDay,
      endDay: (search.sprintEndDay ?? 5) as WeekDay,
      offset: search.sprintOffset ?? 0,
    }),
    [search.sprintStartDay, search.sprintEndDay, search.sprintOffset]
  );

  const rangeFrom = search.from ? parseDateParam(search.from) : undefined;
  const rangeTo = search.to ? parseDateParam(search.to) : undefined;

  const [editTask, setEditTask] = useState<Task | null>(null);
  const [logTaskId, setLogTaskId] = useState<string | null>(null);
  const logTask = tasks.find((t) => t.id === logTaskId) || null;

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
    const tagsMap = new Map<string, Tag>();
    tasks.forEach((t) => t.tags?.forEach((tag) => tagsMap.set(tag.label, tag)));
    return Array.from(tagsMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [tasks]);

  const handleSprintNavigate = (direction: 'prev' | 'next') => {
    updateSearch({ sprintOffset: sprintConfig.offset + (direction === 'next' ? 1 : -1) });
  };

  const formatDateDisplay = (date: Date) =>
    new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);

  const currentSprintRange = getSprintRange(sprintConfig);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 py-6 px-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="text-blue-500" /> Histórico de Atividades
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Visualize sua linha do tempo e gerencie registros passados.
          </p>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2 flex flex-col lg:flex-row gap-4 items-center shadow-sm">
        <div className="bg-slate-950 p-1 rounded-lg border border-slate-800/50 flex shrink-0 w-full lg:w-auto">
          {(['sprint', 'day', 'range', 'all'] as const).map((m) => (
            <button
              key={m}
              onClick={() =>
                updateSearch({ mode: m, ...(m === 'sprint' ? { sprintOffset: 0 } : {}) })
              }
              className={`
                  flex-1 lg:flex-none px-4 py-1.5 text-[11px] uppercase font-bold rounded-md transition-all duration-200
                  ${
                    mode === m
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                  }
                `}
            >
              {m === 'all' ? 'Tudo' : m === 'sprint' ? 'Sprint' : m === 'day' ? 'Dia' : 'Período'}
            </button>
          ))}
        </div>

        <div className="hidden lg:block w-px h-8 bg-slate-800 mx-2" />

        <div className="flex-1 w-full lg:w-auto flex justify-center lg:justify-start">
          {mode === 'day' && (
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

          {mode === 'sprint' && (
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
                  onValueChange={(v) => updateSearch({ sprintStartDay: Number(v) })}
                >
                  <SelectTrigger className="h-6 w-[50px] text-xs bg-transparent border-none p-0 focus:ring-0 text-blue-400 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OPTIONS.map((d) => (
                      <SelectItem key={`s-${d.value}`} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <Select
                  value={String(sprintConfig.endDay)}
                  onValueChange={(v) => updateSearch({ sprintEndDay: Number(v) })}
                >
                  <SelectTrigger className="h-6 w-[50px] text-xs bg-transparent border-none p-0 focus:ring-0 text-blue-400 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OPTIONS.map((d) => (
                      <SelectItem key={`e-${d.value}`} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {mode === 'range' && (
            <div className="flex items-center gap-2 w-full lg:w-auto animate-in zoom-in-95 duration-200">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`h-9 w-full lg:w-[260px] justify-start text-left font-normal bg-slate-950 border-slate-700 ${!rangeFrom && 'text-muted-foreground'}`}
                  >
                    <CalendarRange className="mr-2 h-4 w-4" />
                    {rangeFrom
                      ? rangeTo
                        ? `${formatDateDisplay(rangeFrom)} - ${formatDateDisplay(rangeTo)}`
                        : formatDateDisplay(rangeFrom)
                      : 'Selecionar Período'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-800" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={rangeFrom}
                    selected={{ from: rangeFrom, to: rangeTo }}
                    onSelect={(range) =>
                      updateSearch({
                        from: range?.from?.toISOString().split('T')[0],
                        to: range?.to?.toISOString().split('T')[0],
                      })
                    }
                    numberOfMonths={2}
                    className="bg-slate-950 text-slate-200"
                  />
                </PopoverContent>
              </Popover>
              {(rangeFrom || rangeTo) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                  onClick={() => updateSearch({ from: undefined, to: undefined })}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {mode === 'all' && (
            <span className="text-sm text-slate-500 flex items-center gap-2 px-2 italic animate-in fade-in duration-300">
              <ListFilter className="w-4 h-4" /> Exibindo todo o histórico disponível
            </span>
          )}
        </div>

        <div className="hidden lg:block w-px h-8 bg-slate-800 mx-2" />

        <div className="w-full lg:w-[180px] shrink-0">
          <Select value={statusFilter} onValueChange={(v) => updateSearch({ status: v as any })}>
            <SelectTrigger className="w-full bg-slate-950 border-slate-700 h-9 text-xs focus:ring-0 text-slate-300">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${statusFilter === 'all' ? 'bg-slate-500' : statusFilter === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                />
                <SelectValue placeholder="Filtrar Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="completed">Concluídos</SelectItem>
              <SelectItem value="active">Em Andamento</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="py-20 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20">
          <Filter className="mx-auto h-12 w-12 opacity-20 mb-4" />
          <p>Nenhum registro encontrado com os filtros atuais.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <Badge variant="outline" className="bg-slate-900 text-slate-500 border-slate-800">
              {filteredTasks.length} Atividades encontradas
            </Badge>
          </div>
          {filteredTasks.map((task) => (
            <HistoryItem
              key={task.id}
              task={task}
              onEdit={setEditTask}
              onLog={setLogTaskId}
              onReopen={reopenTask}
              onDelete={deleteTask}
            />
          ))}
        </div>
      )}
      <EditTaskModal
        task={editTask}
        onClose={() => setEditTask(null)}
        availableTags={availableTags}
        onSave={(updated) => {
          updateTaskDetails(updated);
          setEditTask(null);
        }}
      />
      <LogEditorModal
        task={logTask}
        onClose={() => setLogTaskId(null)}
        onAddInterval={addManualInterval}
        onDeleteInterval={deleteInterval}
        onUpdateInterval={updateInterval}
      />
    </div>
  );
}
