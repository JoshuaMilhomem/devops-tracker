import { CheckCircle2, Clock, Pause, Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { calculateTotalMs, calculateWorkUnits, formatTime } from '@/lib/time-utils';
import type { Task } from '@/types';

interface ActiveTaskHeroProps {
  task: Task;
  onEdit: (task: Task) => void;
  onPause: (id: string) => void;
  onComplete: (id: string) => void;
}

export function ActiveTaskHero({ task, onEdit, onPause, onComplete }: ActiveTaskHeroProps) {
  return (
    <div className="sticky top-24">
      <Card className="border-blue-500/30 bg-linear-to-b from-slate-900 to-slate-950 shadow-xl relative overflow-hidden ring-1 ring-blue-500/20">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Clock size={120} />
        </div>
        <CardContent className="pt-6 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>{' '}
              Em Execução
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={() => onEdit(task)}
            >
              <Pencil size={12} />
            </Button>
          </div>
          <h2 className="text-xl font-bold text-white mb-1 leading-tight wrap-break-word">
            {task.name}
          </h2>
          {task.description && (
            <p className="text-sm text-slate-400 mb-4 line-clamp-2">{task.description}</p>
          )}
          <div className="my-6">
            <div className="font-mono text-5xl font-light text-white tracking-tight">
              {formatTime(calculateTotalMs(task.intervals))}
            </div>
            <div className="text-sm text-slate-400 font-mono mt-1 flex items-center gap-2">
              <span className="text-blue-400 font-bold">
                {calculateWorkUnits(calculateTotalMs(task.intervals))}
              </span>{' '}
              Work Units
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="border-slate-700 hover:bg-slate-800 hover:text-white"
              onClick={() => onPause(task.id)}
            >
              <Pause className="mr-2 h-4 w-4" /> Pausar
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white border-0"
              onClick={() => onComplete(task.id)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Concluir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
