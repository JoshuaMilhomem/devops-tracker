import { useState } from 'react';

import { useAtomValue } from 'jotai';

import { EditTaskModal } from '@/components/shared/task-modals';
import { ActiveTaskHero } from '@/features/tracker/components/active-task-hero';
import { useTaskManager } from '@/hooks/use-task-manager';
import { activeTaskAtom } from '@/store/task-atoms';
import type { Task } from '@/types';

export function GlobalTaskOverlay() {
  const runningTask = useAtomValue(activeTaskAtom);

  const { tasks, pauseTask, completeTask, startTask, updateTaskDetails } = useTaskManager();

  const [editTask, setEditTask] = useState<Task | null>(null);

  const [visibleTaskId, setVisibleTaskId] = useState<string | null>(null);

  const [prevRunningTask, setPrevRunningTask] = useState<Task | null>(null);

  if (runningTask !== prevRunningTask) {
    setPrevRunningTask(runningTask);

    if (runningTask) {
      setVisibleTaskId(runningTask.id);
    }
  }

  const taskToRender = tasks.find((t) => t.id === visibleTaskId);

  if (!taskToRender) return null;
  if (taskToRender.status === 'completed') return null;

  const handleClose = () => {
    setVisibleTaskId(null);
  };

  const handleComplete = (id: string) => {
    completeTask(id);
    setVisibleTaskId(null);
  };

  return (
    <>
      <ActiveTaskHero
        task={taskToRender}
        onPause={pauseTask}
        onResume={startTask}
        onComplete={handleComplete}
        onClose={handleClose}
        onEdit={setEditTask}
      />

      <EditTaskModal
        task={editTask}
        onClose={() => setEditTask(null)}
        onSave={(updated) => {
          updateTaskDetails(updated);
          setEditTask(null);
        }}
      />
    </>
  );
}
