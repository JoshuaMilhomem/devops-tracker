import { useEffect, useState } from 'react';

import { createPortal } from 'react-dom';

import { useAtomValue } from 'jotai';
import { Pause, PictureInPicture, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useDocumentPiP } from '@/hooks/use-document-pip';
import { useTaskManager } from '@/hooks/use-task-manager';
import { calculateTotalMs, formatTime } from '@/lib/time-utils';
import { activeTaskAtom } from '@/store/task-atoms';

export function ActiveTaskWidget() {
  const activeTask = useAtomValue(activeTaskAtom);
  const { pauseTask } = useTaskManager();
  const [elapsed, setElapsed] = useState(0);

  const { pipWindow, openPiP, closePiP } = useDocumentPiP({ width: 320, height: 60 });

  useEffect(() => {
    if (!activeTask) {
      if (pipWindow) closePiP();
      return;
    }

    const tick = () => setElapsed(calculateTotalMs(activeTask.intervals));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [activeTask, pipWindow, closePiP]);

  if (!activeTask) return null;

  const WidgetContent = (
    <div
      className={`flex items-center gap-3 w-full h-full ${pipWindow ? 'justify-center px-4' : 'bg-slate-900/80 border border-blue-500/30 rounded-full pl-4 pr-1 py-1 shadow-lg shadow-blue-900/10'}`}
    >
      <div className="flex items-center gap-3 text-xs font-medium text-slate-200 cursor-default">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>

        <span className="font-mono text-blue-400 font-bold text-sm">{formatTime(elapsed)}</span>

        <span className="max-w-[120px] truncate hidden sm:inline-block" title={activeTask.name}>
          {activeTask.name}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 rounded-full hover:bg-blue-500/20 hover:text-blue-400"
          onClick={() => pauseTask(activeTask.id)}
          title="Pausar Tarefa"
        >
          <Pause size={14} fill="currentColor" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 rounded-full hover:bg-purple-500/20 hover:text-purple-400"
          onClick={pipWindow ? closePiP : openPiP}
          title={pipWindow ? 'Voltar para a App' : 'Modo Flutuante (PiP)'}
        >
          {pipWindow ? <X size={14} /> : <PictureInPicture size={14} />}
        </Button>
      </div>
    </div>
  );

  if (pipWindow) {
    return createPortal(WidgetContent, pipWindow.document.body);
  }

  return <div className="animate-in slide-in-from-top-2 duration-300">{WidgetContent}</div>;
}
