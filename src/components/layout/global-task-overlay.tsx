import { useState } from 'react';

import { useAtomValue } from 'jotai';

import { EditTaskModal } from '@/components/shared/task-modals';
import { ActiveTaskHero } from '@/features/tracker/components/active-task-hero';
import { useTaskManager } from '@/hooks/use-task-manager';
import { activeTaskAtom } from '@/store/task-atoms';
import type { Task } from '@/types';

export function GlobalTaskOverlay() {
  const activeTask = useAtomValue(activeTaskAtom);
  const { pauseTask, completeTask, updateTaskDetails } = useTaskManager();

  const [editTask, setEditTask] = useState<Task | null>(null);

  if (!activeTask) return null;

  return (
    <>
      <ActiveTaskHero
        task={activeTask}
        onPause={pauseTask}
        onComplete={completeTask}
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
