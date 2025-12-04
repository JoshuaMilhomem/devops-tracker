import { useEffect, useState } from 'react';

import { CalendarDays, Loader2, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { calculateWorkUnits } from '@/lib/time-utils';
import type { Task } from '@/types';

export const EditTaskModal = ({
  task,
  onClose,
  onSave,
}: {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
}) => {
  const [localTask, setLocalTask] = useState<Task | null>(task);

  useEffect(() => {
    setLocalTask(task);
  }, [task]);

  if (!task || !localTask) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localTask);
  };

  return (
    <Dialog open={!!task} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
          <DialogDescription>Faça alterações nos detalhes da tarefa abaixo.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome da Atividade</Label>
            <Input
              id="name"
              value={localTask.name}
              onChange={(e) => setLocalTask({ ...localTask, name: e.target.value })}
              className="col-span-3"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="desc">Descrição</Label>
            <Textarea
              id="desc"
              value={localTask.description || ''}
              onChange={(e) => setLocalTask({ ...localTask, description: e.target.value })}
              className="col-span-3 min-h-20"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sp">Story Points</Label>
            <Input
              id="sp"
              type="number"
              className="w-full"
              value={localTask.storyPoints}
              onChange={(e) => setLocalTask({ ...localTask, storyPoints: Number(e.target.value) })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const LogEditorModal = ({
  task,
  onClose,
  onAddInterval,
  onDeleteInterval,
  onUpdateInterval,
}: {
  task: Task | null;
  onClose: () => void;
  onAddInterval: (taskId: string) => void;
  onDeleteInterval: (taskId: string, intervalId: string) => void;
  onUpdateInterval: (
    taskId: string,
    intervalId: string,
    field: 'start' | 'end',
    value: string
  ) => void;
}) => {
  if (!task) return null;

  const handleDateChange = (intervalId: string, field: 'start' | 'end', inputValue: string) => {
    if (!inputValue) return;
    const localDate = new Date(inputValue);
    onUpdateInterval(task.id, intervalId, field, localDate.toISOString());
  };

  const toLocalInput = (dateStr: string | null): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);

    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const calculateTotal = (intervals: typeof task.intervals): number =>
    intervals.reduce(
      (sum, i) => sum + (i.end ? new Date(i.end).getTime() - new Date(i.start).getTime() : 0),
      0
    );

  const formatSessionTime = (ms: number): string => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Dialog open={!!task} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Logs de Tempo
          </DialogTitle>
          <DialogDescription>
            Gerencie as sessões de tempo para{' '}
            <span className="font-medium text-foreground">{task.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 py-4 space-y-4">
          {task.intervals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <CalendarDays className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm">Nenhum intervalo registrado.</p>
            </div>
          )}

          {task.intervals.map((interval, index) => {
            const sessionDuration = interval.end
              ? new Date(interval.end).getTime() - new Date(interval.start).getTime()
              : new Date().getTime() - new Date(interval.start).getTime();

            return (
              <div
                key={interval.id}
                className="bg-muted/40 p-4 rounded-lg border flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Sessão {index + 1}
                    </span>
                    <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {formatSessionTime(sessionDuration)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => onDeleteInterval(task.id, interval.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">Início</Label>
                    <Input
                      type="datetime-local"
                      value={toLocalInput(interval.start)}
                      onChange={(e) => handleDateChange(interval.id, 'start', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">Fim</Label>
                    {interval.end === null ? (
                      <div className="h-8 flex items-center px-3 text-xs text-primary bg-primary/5 border rounded-md italic gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" /> Em andamento...
                      </div>
                    ) : (
                      <Input
                        type="datetime-local"
                        value={toLocalInput(interval.end)}
                        onChange={(e) => handleDateChange(interval.id, 'end', e.target.value)}
                        className="h-8 text-xs"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onAddInterval(task.id)}
            className="w-full sm:w-auto"
          >
            Adicionar Intervalo Manual
          </Button>
          <div className="flex-1" />
          <div className="flex flex-col items-end px-2">
            <div className="text-sm font-bold">
              Total: {formatSessionTime(calculateTotal(task.intervals))}
            </div>
            <div className="text-xs text-muted-foreground">
              {calculateWorkUnits(calculateTotal(task.intervals))} WT
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
