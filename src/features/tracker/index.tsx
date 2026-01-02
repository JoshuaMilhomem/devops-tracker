import { useEffect, useMemo, useState } from 'react';

import { CheckCircle2, Pause, StopCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTaskManager } from '@/hooks/use-task-manager';
import type { Tag, Task } from '@/types';

import { EditTaskModal, LogEditorModal } from '../../components/shared/task-modals';
import { CreateTaskForm } from './components/create-task-form';
import { TaskQueueItem } from './components/task-queue-item';

export default function TrackerView() {
  const {
    tasks,
    createTask,
    startTask,
    pauseTask,
    completeTask,
    deleteTask,
    checkActiveTask,
    updateTaskDetails,
    addManualInterval,
    deleteInterval,
    updateInterval,
  } = useTaskManager();

  const [_, setNow] = useState(() => Date.now());

  const [conflictTask, setConflictTask] = useState<{ id: string; name: string } | null>(null);
  const [pendingStartId, setPendingStartId] = useState<string | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const [logTaskId, setLogTaskId] = useState<string | null>(null);
  const logTask = tasks.find((t) => t.id === logTaskId) || null;

  const availableTags = useMemo(() => {
    const tagsMap = new Map<string, Tag>();
    tasks.forEach((t) => {
      t.tags?.forEach((tag) => {
        if (!tagsMap.has(tag.label)) {
          tagsMap.set(tag.label, tag);
        }
      });
    });
    return Array.from(tagsMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [tasks]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStartRequest = (id: string) => {
    const active = checkActiveTask(id);
    if (active) {
      setConflictTask({ id: active.id, name: active.name });
      setPendingStartId(id);
    } else {
      startTask(id);
    }
  };

  const resolveConflict = (action: 'pause' | 'complete') => {
    if (conflictTask && pendingStartId) {
      if (action === 'pause') pauseTask(conflictTask.id);
      else completeTask(conflictTask.id);

      startTask(pendingStartId);

      setConflictTask(null);
      setPendingStartId(null);
    }
  };

  const activeTask = tasks.find((t) => t.status === 'running');
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');

  return (
    <div className="grid gap-6 lg:gap-8 lg:grid-cols-[350px_1fr] w-full max-w-[100vw] overflow-x-hidden pb-20 lg:pb-0">
      <div className="space-y-6 w-full">
        <CreateTaskForm onCreate={createTask} availableTags={availableTags} />
      </div>

      {/* [FIX] Adicionado 'min-w-0' aqui. Isso é crucial em CSS Grid/Flex. 
          Sem isso, se o conteúdo interno for largo, ele empurra o grid. 
          Com min-w-0, ele força o conteúdo a respeitar o truncate. */}
      <div className="space-y-4 w-full min-w-0">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Fila de Tarefas
          </h2>
          <Badge variant="secondary" className="bg-slate-800 text-slate-300 shrink-0">
            {pendingTasks.length} Pendentes
          </Badge>
        </div>

        {pendingTasks.length === 0 && !activeTask && (
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 bg-slate-900/30 text-center px-4">
            <StopCircle size={48} className="mb-4 opacity-20" />
            <p className="font-medium">Sua fila está vazia</p>
            <p className="text-sm">Adicione uma nova tarefa para começar.</p>
          </div>
        )}

        <div className="space-y-3">
          {pendingTasks.map((task) => (
            <TaskQueueItem
              key={task.id}
              task={task}
              onStart={handleStartRequest}
              onEdit={setEditTask}
              onLog={setLogTaskId}
              onDelete={deleteTask}
              onComplete={completeTask}
            />
          ))}
        </div>

        {activeTask && <div className="h-32 w-full" aria-hidden="true" />}
      </div>

      <Dialog open={!!conflictTask} onOpenChange={(open) => !open && setConflictTask(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 sm:max-w-[425px] w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <StopCircle className="text-yellow-500 shrink-0" size={20} />
              <span className="truncate">Tarefa em Andamento</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 pt-2">
              A tarefa <span className="text-white font-medium">"{conflictTask?.name}"</span> ainda
              está a ser cronometrada.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => resolveConflict('pause')}
              className="border-slate-700 hover:bg-slate-800 text-slate-300 w-full sm:w-auto"
            >
              <Pause className="mr-2 h-4 w-4" /> Pausar Anterior
            </Button>
            <Button
              onClick={() => resolveConflict('complete')}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 w-full sm:w-auto"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Concluir Anterior
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditTaskModal
        task={editTask}
        onClose={() => setEditTask(null)}
        availableTags={availableTags}
        onSave={(updated) => {
          updateTaskDetails(updated);
          setEditTask(null);
        }}
      />

      <LogEditorModal
        task={logTask}
        onClose={() => setLogTaskId(null)}
        onAddInterval={addManualInterval}
        onDeleteInterval={deleteInterval}
        onUpdateInterval={updateInterval}
      />
    </div>
  );
}
