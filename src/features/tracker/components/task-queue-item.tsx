import { CalendarDays, CheckCircle2, Clock, Pencil, Play, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  calculateStoryPoints,
  calculateTotalMs,
  calculateWorkUnits,
  formatTime,
} from '@/lib/time-utils';
import type { Task } from '@/types';

interface TaskQueueItemProps {
  task: Task;
  onStart: (id: string) => void;
  onEdit: (task: Task) => void;
  onLog: (id: string) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

export function TaskQueueItem({
  task,
  onStart,
  onEdit,
  onLog,
  onDelete,
  onComplete,
}: TaskQueueItemProps) {
  const totalMs = calculateTotalMs(task.intervals);
  const dynamicSp = calculateStoryPoints(totalMs);
  const hasSessions = task.intervals.length > 0;

  return (
    <Card className="group border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700 transition-all duration-200">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-200 truncate text-base">{task.name}</h3>
            {task.tags?.map((tag) => (
              <Badge
                key={tag.id}
                className={`${tag.color} text-white border-0 text-[10px] h-5 px-1.5`}
              >
                {tag.label}
              </Badge>
            ))}
            {task.status === 'paused' && (
              <Badge
                variant="outline"
                className="text-yellow-500 border-yellow-500/20 bg-yellow-500/10 text-[10px] h-5 px-1.5"
              >
                Pausada
              </Badge>
            )}
            {dynamicSp > 0 && (
              <Badge
                variant="secondary"
                className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] h-5 px-1.5"
              >
                {dynamicSp} SP
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              <Clock size={12} className="text-blue-500" /> {formatTime(totalMs)}
            </span>
            <span className="text-slate-500">{calculateWorkUnits(totalMs)} WT</span>
          </div>
        </div>

        <div className="flex gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto justify-end sm:justify-start mt-2 sm:mt-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editar Detalhes</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLog(task.id);
                  }}
                >
                  <CalendarDays className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ver/Editar Sessões</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 border-slate-700 bg-transparent hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/50 text-slate-400"
                  onClick={() => onStart(task.id)}
                >
                  <Play className="h-4 w-4 ml-0.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Iniciar Tarefa</TooltipContent>
            </Tooltip>

            {hasSessions && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 border-slate-700 bg-transparent hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/50 text-slate-400"
                    onClick={() => onComplete(task.id)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Concluir Tarefa</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                  onClick={() => onDelete(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Excluir Tarefa</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
