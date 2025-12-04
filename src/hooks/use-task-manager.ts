import { useAtom } from 'jotai';
import { toast } from 'sonner';

import { tasksAtom } from '@/store/task-atoms';
import type { Tag, Task } from '@/types';

export const useTaskManager = () => {
  const [tasks, setTasks] = useAtom(tasksAtom);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const createTask = (name: string, desc: string, sp: number, tags: Tag[] = []) => {
    if (!name.trim()) return;

    const newTask: Task = {
      id: generateId(),
      name,
      description: desc,
      storyPoints: sp,
      tags,
      status: 'idle',
      intervals: [],
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    toast.success('Tarefa Criada com sucesso.');
  };
  const startTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'running',
            intervals: [
              ...t.intervals,
              { id: generateId(), start: new Date().toISOString(), end: null },
            ],
          };
        }
        return t;
      })
    );
  };

  const pauseTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.status === 'running') {
          return {
            ...t,
            status: 'paused',
            intervals: t.intervals.map((i) =>
              i.end ? i : { ...i, end: new Date().toISOString() }
            ),
          };
        }
        return t;
      })
    );
  };

  const completeTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const intervals =
            t.status === 'running'
              ? t.intervals.map((i) => (i.end ? i : { ...i, end: new Date().toISOString() }))
              : t.intervals;

          return {
            ...t,
            status: 'completed',
            completedAt: new Date().toISOString(),
            intervals,
          };
        }
        return t;
      })
    );
    toast.success('Tarefa Concluída: Marcada como concluída com sucesso.');
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success('Tarefa Removida: Removida da fila com sucesso.');
  };

  const checkActiveTask = (targetId: string) => {
    return tasks.find((t) => t.status === 'running' && t.id !== targetId);
  };

  const reopenTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            status: t.intervals.length > 0 ? 'paused' : 'idle',
            completedAt: undefined,
          };
        }
        return t;
      })
    );
    toast.info('Tarefa reaberta e movida para a fila.');
  };

  const updateTaskDetails = (task: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    toast.success('Detalhes atualizados com sucesso.');
  };
  const addManualInterval = (taskId: string) => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              intervals: [
                ...t.intervals,
                { id: generateId(), start: oneHourAgo.toISOString(), end: now.toISOString() },
              ],
            }
          : t
      )
    );
    toast.success('Sessão manual adicionada.');
  };

  const deleteInterval = (taskId: string, intervalId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              intervals: t.intervals.filter((i) => i.id !== intervalId),
            }
          : t
      )
    );
    toast.info('Sessão removida.');
  };

  const updateInterval = (
    taskId: string,
    intervalId: string,
    field: 'start' | 'end',
    value: string
  ) => {
    const isoDate = new Date(value).toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          intervals: t.intervals.map((i) => (i.id !== intervalId ? i : { ...i, [field]: isoDate })),
        };
      })
    );
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
