import {
  CheckCircle2,
  GripHorizontal,
  Maximize2,
  Minimize2,
  Pause,
  Pencil,
  PictureInPicture,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { calculateWorkUnits, formatTime } from '@/lib/time-utils';
import type { Task } from '@/types';

export interface HeroContentProps {
  task: Task;
  elapsed: number;
  isMinimized: boolean;
  inPip?: boolean;
  disableMaximize?: boolean;
  onPause: (id: string) => void;
  onComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onToggleMinimize: () => void;
  onTogglePip: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function HeroContent({
  task,
  elapsed,
  isMinimized,
  inPip = false,
  disableMaximize = false,
  onPause,
  onComplete,
  onEdit,
  onToggleMinimize,
  onTogglePip,
  dragHandleProps,
}: HeroContentProps) {
  let containerClasses = '';

  if (inPip) {
    containerClasses = 'w-full h-full flex flex-col bg-slate-950 border-0';
  } else if (disableMaximize) {
    containerClasses =
      'w-full bg-slate-900 border-t border-slate-800 rounded shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]';
  } else {
    containerClasses =
      'w-full shadow-2xl relative overflow-hidden ring-1 ring-blue-500/20 backdrop-blur-xl bg-slate-900/90 rounded-xl border-blue-500/30 pt-0';
  }

  if (isMinimized) {
    return (
      <div className={`${containerClasses} p-3 flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-3 overflow-hidden min-w-0">
          {!inPip && !disableMaximize && dragHandleProps && (
            <div
              className="cursor-move text-slate-600 hover:text-slate-400 p-1 shrink-0"
              {...dragHandleProps}
            >
              <GripHorizontal size={18} />
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-blue-500"></span>
              </span>
              Running
            </span>
            <span className="font-mono text-xl font-bold text-white leading-none mt-0.5 truncate">
              {formatTime(elapsed)}
            </span>
          </div>

          {disableMaximize && (
            <span className="text-xs text-slate-400 truncate hidden xs:block">{task.name}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 hover:bg-white/10 text-slate-300 hover:text-white"
            onClick={() => onPause(task.id)}
            title="Pausar"
          >
            <Pause size={18} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 hover:bg-green-500/20 text-green-500"
            onClick={() => onComplete(task.id)}
            title="Concluir"
          >
            <CheckCircle2 size={18} />
          </Button>

          {!inPip && !disableMaximize && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:bg-white/10 text-slate-400 hover:text-white"
              onClick={onToggleMinimize}
              title="Maximizar"
            >
              <Maximize2 size={14} />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={containerClasses}>
      <div
        className={`flex items-center justify-between px-3 py-2 sm:px-4 border-b border-white/5 bg-white/5 select-none shrink-0 ${
          !inPip ? 'cursor-move' : ''
        }`}
        {...(!inPip ? dragHandleProps : {})}
      >
        <div className="flex items-center gap-2 text-blue-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
          {!inPip && <GripHorizontal size={14} className="opacity-50" />}
          <span>Em Execução</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-slate-400 hover:text-white hover:bg-white/10"
            onClick={onTogglePip}
            title={inPip ? 'Fechar Janela Flutuante' : 'Abrir Janela Flutuante'}
          >
            {inPip ? <X size={14} /> : <PictureInPicture size={14} />}
          </Button>
          {!inPip && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-slate-400 hover:text-white hover:bg-white/10"
              onClick={onToggleMinimize}
              title="Minimizar"
            >
              <Minimize2 size={14} />
            </Button>
          )}
        </div>
      </div>

      <CardContent className="p-4 sm:p-6 flex flex-col gap-2 sm:gap-4 relative z-10 h-full overflow-hidden">
        <div className="flex items-start justify-between gap-2 sm:gap-4 shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-xl font-bold text-white leading-tight truncate sm:whitespace-normal sm:line-clamp-2">
              {task.name}
            </h2>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0 text-slate-400 hover:text-white hover:bg-white/10 h-7 w-7 sm:h-9 sm:w-9"
            onClick={() => onEdit(task)}
          >
            <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
        <div className="py-1 sm:py-2 flex-1 flex flex-col justify-center text-center sm:text-left">
          <div className="font-mono text-4xl sm:text-5xl font-light text-white tracking-tight tabular-nums transition-all duration-300">
            {formatTime(elapsed)}
          </div>
          <div className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
            <span className="text-blue-400 font-bold">{calculateWorkUnits(elapsed)}</span> Work
            Units
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-auto shrink-0">
          <Button
            variant="outline"
            className="border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white h-9 sm:h-11 text-xs sm:text-sm"
            onClick={() => onPause(task.id)}
          >
            <Pause className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Pausar
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white border-0 h-9 sm:h-11 text-xs sm:text-sm shadow-lg shadow-green-900/20"
            onClick={() => onComplete(task.id)}
          >
            <CheckCircle2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Concluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
