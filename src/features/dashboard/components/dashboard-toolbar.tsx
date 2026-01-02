import {
  ArrowRight,
  CalendarDays,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
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

import type { DashboardFilter } from '../hooks/use-dashboard-stats';

const DAYS_OPTIONS = [
  { value: '0', label: 'Dom' },
  { value: '1', label: 'Seg' },
  { value: '2', label: 'Ter' },
  { value: '3', label: 'Qua' },
  { value: '4', label: 'Qui' },
  { value: '5', label: 'Sex' },
  { value: '6', label: 'Sáb' },
];

interface DashboardToolbarProps {
  filter: DashboardFilter;
  selectedDate: string;
  sprintConfig: { startDay: number; endDay: number; offset: number };
  currentSprintRange: { start: Date; end: Date };
  currentMonthValue: string;
  monthOptions: { value: string; label: string }[];
  onUpdateSearch: (params: any) => void;
  onSprintNavigate: (dir: 'prev' | 'next') => void;
  formatDate: (date: Date) => string;
}

export function DashboardToolbar({
  filter,
  selectedDate,
  sprintConfig,
  currentSprintRange,
  currentMonthValue,
  monthOptions,
  onUpdateSearch,
  onSprintNavigate,
  formatDate,
}: DashboardToolbarProps) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2 flex flex-col lg:flex-row gap-4 items-center shadow-sm">
      {/* 1. Toggle de Tipo */}
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

              onUpdateSearch({
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

      {/* 2. Controles Dinâmicos */}
      <div className="flex-1 w-full lg:w-auto flex justify-center lg:justify-start">
        {/* MODO DIA */}
        {filter === 'day' && (
          <div className="relative w-full lg:max-w-[200px] animate-in zoom-in-95 duration-200">
            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => onUpdateSearch({ date: e.target.value })}
              className="pl-9 bg-slate-950 border-slate-700 h-9 text-sm w-full"
            />
          </div>
        )}

        {/* MODO SPRINT */}
        {filter === 'sprint' && (
          <div className="flex flex-wrap items-center gap-2 animate-in zoom-in-95 duration-200 w-full lg:w-auto justify-center lg:justify-start">
            <div className="flex items-center bg-slate-950 rounded-md border border-slate-800 p-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded hover:bg-slate-900"
                onClick={() => onSprintNavigate('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 text-xs font-mono text-slate-300 min-w-[100px] text-center">
                {formatDate(currentSprintRange.start)} - {formatDate(currentSprintRange.end)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded hover:bg-slate-900"
                onClick={() => onSprintNavigate('next')}
                disabled={sprintConfig.offset >= 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 rounded-md border border-slate-800 p-1 px-2 h-9">
              <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Ciclo:</span>
              <Select
                value={String(sprintConfig.startDay)}
                onValueChange={(v) => onUpdateSearch({ startDay: Number(v) })}
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
                onValueChange={(v) => onUpdateSearch({ endDay: Number(v) })}
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

        {/* MODO MÊS */}
        {filter === 'month' && (
          <div className="flex items-center gap-2 animate-in zoom-in-95 duration-200 w-full lg:w-auto">
            <Select value={currentMonthValue} onValueChange={(v) => onUpdateSearch({ date: v })}>
              <SelectTrigger className="w-full lg:w-60 bg-slate-950 border-slate-700 h-9 text-sm focus:ring-0">
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
  );
}
