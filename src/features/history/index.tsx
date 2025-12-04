import { useState } from 'react';

import { useTaskManager } from '@/hooks/use-task-manager';
import type { Task } from '@/types';

import { EditTaskModal, LogEditorModal } from '../../components/shared/task-modals';
import { HistoryItem } from './components/history-item';

export default function HistoryView() {
  const {
    tasks,
    reopenTask,
    deleteTask,
    updateTaskDetails,
    addManualInterval,
    deleteInterval,
    updateInterval,
  } = useTaskManager();

  const [editTask, setEditTask] = useState<Task | null>(null);
  const [logTaskId, setLogTaskId] = useState<string | null>(null);

  const logTask = tasks.find((t) => t.id === logTaskId) || null;

  const completedTasks = tasks
    .filter((t) => t.status === 'completed')
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  if (completedTasks.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <h3 className="text-lg font-medium">Nenhum histórico ainda</h3>
        <p>Complete tarefas para vê-las aqui.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">Histórico de Conclusão</h2>

      {completedTasks.map((task) => (
        <HistoryItem
          key={task.id}
          task={task}
          onEdit={setEditTask}
          onLog={setLogTaskId}
          onReopen={reopenTask}
          onDelete={deleteTask}
        />
      ))}

      <EditTaskModal
        task={editTask}
        onClose={() => setEditTask(null)}
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
