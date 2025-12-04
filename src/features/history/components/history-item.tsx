import { CalendarDays, Clock, List, Pencil, RotateCcw, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { calculateTotalMs, calculateWorkUnits, formatTime } from '@/lib/time-utils';
import type { Task } from '@/types';

interface HistoryItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onLog: (id: string) => void;
  onReopen: (id: string) => void;
  onDelete: (id: string) => void;
}

export function HistoryItem({ task, onEdit, onLog, onReopen, onDelete }: HistoryItemProps) {
  const totalMs = calculateTotalMs(task.intervals);

  return (
    <Card className="group flex flex-col p-5 border-slate-800 bg-slate-900/20 hover:bg-slate-900/40 transition-colors gap-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-slate-200 text-lg line-through decoration-slate-600 decoration-2">
              {task.name}
            </h4>
            {task.storyPoints > 0 && (
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                {task.storyPoints} SP
              </span>
            )}
          </div>

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
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>
                Finalizada em {new Date(task.completedAt!).toLocaleDateString()} às{' '}
                {new Date(task.completedAt!).toLocaleTimeString()}
              </span>
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
