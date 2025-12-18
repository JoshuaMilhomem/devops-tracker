import { useState } from 'react';

import { ArrowRight, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

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

import { ActivityList } from './components/activity-list';
import { MetricsCards } from './components/metrics-cards';
import { type DashboardFilter, type WeekDay, useDashboardStats } from './hooks/use-dashboard-stats';

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
  const [filter, setFilter] = useState<DashboardFilter>('sprint');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [sprintConfig, setSprintConfig] = useState<{
    startDay: WeekDay;
    endDay: WeekDay;
    offset: number;
  }>({
    startDay: 1,
    endDay: 5,
    offset: 0,
  });

  const { stats, activities, periodLabel } = useDashboardStats(
    tasks,
    filter,
    selectedDate,
    sprintConfig
  );

  const handleSprintNavigate = (direction: 'prev' | 'next') => {
    setSprintConfig((prev) => ({
      ...prev,
      offset: prev.offset + (direction === 'next' ? 1 : -1),
    }));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 ">
      {/* Header Responsivo */}
      <div className="flex flex-col xl:flex-row justify-between items-end xl:items-center gap-4 bg-slate-900/50 p-3 rounded-lg border border-slate-800 transition-all duration-1500 ease-in-out min-h-25 ">
        {/* Controles de Esquerda */}
        <div className="flex items-center gap-4 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0">
          {/* Seletor de Data Única */}
          {filter === 'day' && (
            <div className="relative animate-in fade-in duration-300">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
                <CalendarIcon className="h-3.5 w-3.5" />
              </div>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-8 h-9 bg-slate-950 border-slate-700 w-[150px] text-xs"
              />
            </div>
          )}

          {/* Controles de Sprint */}
          {filter === 'sprint' && (
            <div className="flex items-center gap-2 bg-slate-950/50 p-1.5 rounded-md border border-slate-800 animate-in fade-in duration-300">
              {/* Navegação */}
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-white"
                  onClick={() => handleSprintNavigate('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex flex-col items-center min-w-[120px] px-2">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    {sprintConfig.offset === 0
                      ? 'Sprint Atual'
                      : `Sprint ${sprintConfig.offset > 0 ? '+' : ''}${sprintConfig.offset}`}
                  </span>
                  <span className="text-xs text-slate-200 font-mono font-medium">
                    {formatDate(periodLabel.start)} - {formatDate(periodLabel.end)}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-white"
                  onClick={() => handleSprintNavigate('next')}
                  disabled={sprintConfig.offset >= 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="h-5 w-px bg-slate-800 mx-1" />

              {/* Configuração DE -> ATÉ */}
              <div className="flex items-center gap-1">
                <div className="flex items-center bg-slate-900 rounded border border-slate-800 gap-2 p-1 ">
                  <span className="text-[10px] text-slate-500  font-bold">DE</span>
                  <Select
                    value={String(sprintConfig.startDay)}
                    onValueChange={(v) =>
                      setSprintConfig((p) => ({ ...p, startDay: Number(v) as WeekDay }))
                    }
                  >
                    <SelectTrigger className="h-6  text-[10px] bg-transparent border-none focus:ring-0  text-slate-300">
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
                </div>

                <ArrowRight className="h-3 w-3 text-slate-600" />

                <div className="flex items-center bg-slate-900 rounded border border-slate-800 gap-2 p-1">
                  <span className="text-[10px] text-slate-500 gap-2 p-1 font-bold">ATÉ</span>
                  <Select
                    value={String(sprintConfig.endDay)}
                    onValueChange={(v) =>
                      setSprintConfig((p) => ({ ...p, endDay: Number(v) as WeekDay }))
                    }
                  >
                    <SelectTrigger className="h-6 w-[55px] text-[10px] bg-transparent border-none focus:ring-0 gap-2 p-1 text-slate-300">
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
            </div>
          )}
        </div>

        {/* Toggle de Tipo */}
        <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
          {(['day', 'sprint', 'month'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                if (f === 'sprint') setSprintConfig((prev) => ({ ...prev, offset: 0 }));
              }}
              className={`px-4 py-1.5 text-xs rounded-md uppercase font-bold transition-all ${
                filter === f
                  ? 'bg-slate-800 text-blue-400 shadow-sm border border-slate-700'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
              }`}
            >
              {f === 'day' ? 'Dia' : f === 'sprint' ? 'Sprint' : 'Mês'}
            </button>
          ))}
        </div>
      </div>

      <MetricsCards stats={stats} />
      <ActivityList activities={activities} currentFilter={filter} />
    </div>
  );
}
