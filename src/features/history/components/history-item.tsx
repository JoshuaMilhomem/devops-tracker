import {
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Circle,
  Copy,
  List,
  PauseCircle,
  Pencil,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useWorkUnitFormatter } from '@/hooks/use-work-units-formatter';
import {
  calculateStoryPoints,
  calculateTotalMs,
  calculateWorkUnits,
  formatTime,
} from '@/lib/time-utils';
import type { Task } from '@/types';

interface HistoryItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onLog: (id: string) => void;
  onReopen: (id: string) => void;
  onDelete: (id: string) => void;
}
const getTaskDateRange = (task: Task): string => {
  if (!task.intervals || task.intervals.length === 0) {
    return `Criada em ${new Date(task.createdAt).toLocaleDateString()}`;
  }

  const timestamps = task.intervals.flatMap((i) => {
    const start = new Date(i.start).getTime();
    const end = i.end ? new Date(i.end).getTime() : Date.now();
    return [start, end];
  });

  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);

  const startDate = new Date(minTime);
  const endDate = new Date(maxTime);

  if (startDate.toDateString() === endDate.toDateString()) {
    return startDate.toLocaleDateString();
  }

  return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
};
export function HistoryItem({ task, onEdit, onLog, onReopen, onDelete }: HistoryItemProps) {
  const totalMs = calculateTotalMs(task.intervals);
  const dynamicSp = calculateStoryPoints(totalMs);
  const dateRangeLabel = getTaskDateRange(task);

  const isCompleted = task.status === 'completed';
  const isPaused = task.status === 'paused';
  const statusColor = isCompleted
    ? 'text-emerald-500'
    : isPaused
      ? 'text-yellow-500'
      : 'text-slate-400';

  const StatusIcon = isCompleted ? CheckCircle2 : isPaused ? PauseCircle : Circle;

  const { format: formatWT } = useWorkUnitFormatter();

  const copyWorkUnitsToClipboard = () => {
    const formattedValue = formatWT(totalMs);
    navigator.clipboard.writeText(formattedValue);
    toast.info(`Work Units (${formattedValue}) copiado!`);
  };
  return (
    <Card
      className={`group flex flex-col p-5 border-slate-800 transition-colors gap-4 ${isCompleted ? 'bg-slate-900/20 hover:bg-slate-900/40' : 'bg-slate-900/40 hover:bg-slate-900/60'}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <StatusIcon size={18} className={statusColor} />
                </TooltipTrigger>
                <TooltipContent>
                  {isCompleted ? 'Concluída' : isPaused ? 'Pausada' : 'Pendente'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <h4
              className={`font-medium text-lg ${isCompleted ? 'text-slate-400 line-through decoration-slate-700' : 'text-slate-200'}`}
            >
              {task.name}
            </h4>

            {dynamicSp > 0 && (
              <Badge
                variant="outline"
                className="text-[10px] text-purple-400 border-purple-500/30 bg-purple-500/10 h-5 px-1.5"
              >
                {dynamicSp} SP
              </Badge>
            )}
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  className={`${tag.color} text-white border-0 hover:opacity-90 text-[10px] h-5 px-1.5`}
                >
                  {tag.label}
                </Badge>
              ))}
            </div>
          )}

          {task.description && (
            <p className="text-sm text-slate-400 leading-relaxed bg-slate-950/30 p-2 rounded border border-slate-800/50">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
            <div className="flex items-center gap-1 bg-slate-950/50 px-2 py-0.5 rounded border border-slate-800/50 text-slate-400">
              <List size={12} />
              <span>
                {task.intervals.length} {task.intervals.length === 1 ? 'Sessão' : 'Sessões'}
              </span>
            </div>

            <span>•</span>

            <div className="flex items-center gap-1 text-slate-400">
              <CalendarRange size={12} className="text-blue-500/70" />
              <span className="font-mono">{dateRangeLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-1 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50 min-w-[120px]">
          <div className="text-right">
            <div className="text-slate-200 font-mono text-lg font-medium">
              {formatTime(totalMs)}
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Duração
            </div>
          </div>
          <div className="w-px h-8 bg-slate-800 sm:w-full sm:h-px sm:my-1"></div>
          <div className="text-right">
            <div className="text-blue-400 font-bold font-mono text-lg">
              {calculateWorkUnits(totalMs)}
              <Button
                variant={'ghost'}
                size={'icon-sm'}
                className="p-0 ml-1 opacity-70 hover:opacity-100"
                onClick={copyWorkUnitsToClipboard}
              >
                <Copy size={14} className="inline-block ml-1 mb-0.5" />
              </Button>
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Work Units
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/50 mt-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10"
                onClick={() => onEdit(task)}
              >
                <Pencil size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar Detalhes</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10"
                onClick={() => onLog(task.id)}
              >
                <CalendarDays size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar Sessões de Tempo</TooltipContent>
          </Tooltip>

          <div className="w-px h-4 bg-slate-800 mx-1"></div>

          {isCompleted && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 text-slate-500 hover:text-yellow-500 hover:bg-yellow-500/10"
                  onClick={() => onReopen(task.id)}
                >
                  <RotateCcw size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reabrir Tarefa</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 text-slate-500 hover:text-red-500 hover:bg-red-500/10"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Excluir Permanentemente</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  );
}
