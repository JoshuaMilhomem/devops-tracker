import {
  ArrowRight,
  Calendar as CalendarIcon,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Filter,
  ListFilter,
  X,
} from 'lucide-react';

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

const DAYS_OPTIONS = [
  { value: '0', label: 'Dom' },
  { value: '1', label: 'Seg' },
  { value: '2', label: 'Ter' },
  { value: '3', label: 'Qua' },
  { value: '4', label: 'Qui' },
  { value: '5', label: 'Sex' },
  { value: '6', label: 'Sáb' },
];

interface HistoryToolbarProps {
  mode: string;
  statusFilter: string;
  selectedDate: string;
  sprintConfig: { startDay: number; endDay: number; offset: number };
  rangeFrom?: Date;
  rangeTo?: Date;
  currentSprintRange: { start: Date; end: Date };
  onUpdateSearch: (params: any) => void;
  onSprintNavigate: (dir: 'prev' | 'next') => void;
  formatDate: (date: Date) => string;
}

export function HistoryToolbar({
  mode,
  statusFilter,
  selectedDate,
  sprintConfig,
  rangeFrom,
  rangeTo,
  currentSprintRange,
  onUpdateSearch,
  onSprintNavigate,
  formatDate,
}: HistoryToolbarProps) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2 flex flex-col lg:flex-row gap-4 items-center shadow-sm">
      {/* SELETOR DE MODO */}
      <div className="bg-slate-950 p-1 rounded-lg border border-slate-800/50 flex shrink-0 w-full lg:w-auto">
        {(['sprint', 'day', 'range', 'all'] as const).map((m) => (
          <button
            key={m}
            onClick={() =>
              onUpdateSearch({ mode: m, ...(m === 'sprint' ? { sprintOffset: 0 } : {}) })
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

      {/* CONTROLES DINÂMICOS (MEIO) */}
      <div className="flex-1 w-full lg:w-auto flex justify-center lg:justify-start">
        {mode === 'day' && (
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

        {mode === 'sprint' && (
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
                onValueChange={(v) => onUpdateSearch({ sprintStartDay: Number(v) })}
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
                onValueChange={(v) => onUpdateSearch({ sprintEndDay: Number(v) })}
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
                      ? `${formatDate(rangeFrom)} - ${formatDate(rangeTo)}`
                      : formatDate(rangeFrom)
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
                    onUpdateSearch({
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
                onClick={() => onUpdateSearch({ from: undefined, to: undefined })}
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

      {/* FILTRO DE STATUS (DIREITA) */}
      <div className="w-full lg:w-[180px] shrink-0">
        <Select value={statusFilter} onValueChange={(v) => onUpdateSearch({ status: v as any })}>
          <SelectTrigger className="w-full bg-slate-950 border-slate-700 h-9 text-xs focus:ring-0 text-slate-300">
            <div className="flex items-center gap-2">
              <Filter className="w-3 h-3 text-slate-500" />
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
  );
}
