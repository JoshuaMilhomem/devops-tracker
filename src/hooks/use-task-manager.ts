import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import { useAtom, useAtomValue } from 'jotai';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { syncModeAtom } from '@/store/settings-atoms';
import { tasksAtom } from '@/store/task-atoms';
import type { Tag, Task } from '@/types';

export const useTaskManager = () => {
  const [tasks, setTasks] = useAtom(tasksAtom);
  const syncMode = useAtomValue(syncModeAtom);
  const { user } = useAuth();

  const persistTask = async (task: Task) => {
    if (!user || syncMode === 'manual') return;

    try {
      await setDoc(doc(db, 'users', user.uid, 'tasks', task.id), task, { merge: true });
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      toast.error(`Erro ao salvar "${task.name}" na nuvem.`);
    }
  };

  const removeTaskFromCloud = async (taskId: string) => {
    if (!user || syncMode === 'manual') return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'tasks', taskId));
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      toast.error('Erro ao remover tarefa da nuvem.');
    }
  };

  const generateId = () => crypto.randomUUID();

  const createTask = (name: string, desc: string, tags: Tag[] = []) => {
    if (!name.trim()) return;

    const newTask: Task = {
      id: generateId(),
      name,
      description: desc,
      tags,
      status: 'idle',
      intervals: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    toast.success('Tarefa criada.');

    persistTask(newTask);
  };

  const startTask = (taskId: string) => {
    let updatedTask: Task | null = null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          updatedTask = {
            ...t,
            status: 'running',
            updatedAt: new Date().toISOString(),
            intervals: [
              ...t.intervals,
              { id: generateId(), start: new Date().toISOString(), end: null },
            ],
          };
          return updatedTask;
        }
        return t;
      })
    );
    if (updatedTask) persistTask(updatedTask);
  };

  const pauseTask = (taskId: string) => {
    let updatedTask: Task | null = null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.status === 'running') {
          updatedTask = {
            ...t,
            status: 'paused',
            updatedAt: new Date().toISOString(),
            intervals: t.intervals.map((i) =>
              i.end ? i : { ...i, end: new Date().toISOString() }
            ),
          };
          return updatedTask;
        }
        return t;
      })
    );
    if (updatedTask) persistTask(updatedTask);
  };

  const completeTask = (taskId: string) => {
    let updatedTask: Task | null = null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const intervals =
            t.status === 'running'
              ? t.intervals.map((i) => (i.end ? i : { ...i, end: new Date().toISOString() }))
              : t.intervals;
          updatedTask = {
            ...t,
            status: 'completed',
            updatedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            intervals,
          };
          return updatedTask;
        }
        return t;
      })
    );
    if (updatedTask) {
      persistTask(updatedTask);
      toast.success('Tarefa concluída.');
    }
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success('Tarefa removida.');
    removeTaskFromCloud(id);
  };

  const checkActiveTask = (targetId: string) => {
    return tasks.find((t) => t.status === 'running' && t.id !== targetId);
  };

  const reopenTask = (id: string) => {
    let updatedTask: Task | null = null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          updatedTask = {
            ...t,
            updatedAt: new Date().toISOString(),
            status: t.intervals.length > 0 ? 'paused' : 'idle',
            completedAt: undefined,
          };
          return updatedTask;
        }
        return t;
      })
    );
    if (updatedTask) {
      persistTask(updatedTask);
      toast.info('Tarefa reaberta.');
    }
  };

  const updateTaskDetails = (task: Task) => {
    const updatedTask = { ...task, updatedAt: new Date().toISOString() };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
    persistTask(updatedTask);
    toast.success('Detalhes atualizados.');
  };

  const addManualInterval = (taskId: string) => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    let updatedTask: Task | null = null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          updatedTask = {
            ...t,
            updatedAt: new Date().toISOString(),
            intervals: [
              ...t.intervals,
              { id: generateId(), start: oneHourAgo.toISOString(), end: now.toISOString() },
            ],
          };
          return updatedTask;
        }
        return t;
      })
    );
    if (updatedTask) {
      persistTask(updatedTask);
      toast.success('Sessão manual adicionada.');
    }
  };

  const deleteInterval = (taskId: string, intervalId: string) => {
    let updatedTask: Task | null = null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          updatedTask = {
            ...t,
            updatedAt: new Date().toISOString(),
            intervals: t.intervals.filter((i) => i.id !== intervalId),
          };
          return updatedTask;
        }
        return t;
      })
    );
    if (updatedTask) {
      persistTask(updatedTask);
      toast.info('Sessão removida.');
    }
  };

  const updateInterval = (
    taskId: string,
    intervalId: string,
    field: 'start' | 'end',
    value: string
  ) => {
    const isoDate = new Date(value).toISOString();
    let updatedTask: Task | null = null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        updatedTask = {
          ...t,
          updatedAt: new Date().toISOString(),
          intervals: t.intervals.map((i) => (i.id !== intervalId ? i : { ...i, [field]: isoDate })),
        };
        return updatedTask;
      })
    );
    if (updatedTask) persistTask(updatedTask);
  };

  return {
    tasks,
    createTask,
    startTask,
    pauseTask,
    completeTask,
    deleteTask,
    checkActiveTask,
    reopenTask,
    updateTaskDetails,
    addManualInterval,
    deleteInterval,
    updateInterval,
  };
};
