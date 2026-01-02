import { useState } from 'react';

import { Filter, Layers } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { Task } from '@/types';

import { EditTaskModal, LogEditorModal } from '../../components/shared/task-modals';
import { HistoryItem } from './components/history-item';
import { HistoryToolbar } from './components/history-toolbar';
import { useHistoryController } from './hooks/use-history-controller';

export default function HistoryView() {
  const {
    // State
    mode,
    statusFilter,
    selectedDate,
    sprintConfig,
    rangeFrom,
    rangeTo,
    currentSprintRange,
    // Data
    tasks, // Raw tasks apenas para find se necessário
    filteredTasks,
    availableTags,
    // Actions
    updateSearch,
    handleSprintNavigate,
    formatDateDisplay,
    // Task Ops
    reopenTask,
    deleteTask,
    updateTaskDetails,
    addManualInterval,
    deleteInterval,
    updateInterval,
  } = useHistoryController();

  // Local UI State (Modais)
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [logTaskId, setLogTaskId] = useState<string | null>(null);
  const logTask = tasks.find((t) => t.id === logTaskId) || null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="text-blue-500" /> Histórico de Atividades
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Visualize sua linha do tempo e gerencie registros passados.
          </p>
        </div>
      </div>

      {/* Toolbar Isolada */}
      <HistoryToolbar
        mode={mode}
        statusFilter={statusFilter}
        selectedDate={selectedDate}
        sprintConfig={sprintConfig}
        rangeFrom={rangeFrom}
        rangeTo={rangeTo}
        currentSprintRange={currentSprintRange}
        onUpdateSearch={updateSearch}
        onSprintNavigate={handleSprintNavigate}
        formatDate={formatDateDisplay}
      />

      {/* Lista de Resultados */}
      {filteredTasks.length === 0 ? (
        <div className="py-20 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20">
          <Filter className="mx-auto h-12 w-12 opacity-20 mb-4" />
          <p>Nenhum registro encontrado com os filtros atuais.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <Badge variant="outline" className="bg-slate-900 text-slate-500 border-slate-800">
              {filteredTasks.length} Atividades encontradas
            </Badge>
          </div>
          {filteredTasks.map((task) => (
            <HistoryItem
              key={task.id}
              task={task}
              onEdit={setEditTask}
              onLog={setLogTaskId}
              onReopen={reopenTask}
              onDelete={deleteTask}
            />
          ))}
        </div>
      )}

      {/* Modais */}
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
