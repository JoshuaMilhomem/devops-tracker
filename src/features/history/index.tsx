import { useMemo, useState } from 'react';

import { CalendarClock, CheckCircle2, Filter } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTaskManager } from '@/hooks/use-task-manager';
import type { Tag, Task } from '@/types';

import { EditTaskModal, LogEditorModal } from '../../components/shared/task-modals';
import { HistoryItem } from './components/history-item';

type PeriodFilter = 'all' | '7days' | 'month';
type StatusFilter = 'all' | 'completed' | 'active';

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

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('completed');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');

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
  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    const now = new Date();

    if (statusFilter === 'completed') {
      result = result.filter((t) => t.status === 'completed');
    } else if (statusFilter === 'active') {
      result = result.filter((t) => t.status !== 'completed');
    }

    if (periodFilter !== 'all') {
      const cutOffDate = new Date();
      if (periodFilter === '7days') {
        cutOffDate.setDate(now.getDate() - 7);
      } else if (periodFilter === 'month') {
        cutOffDate.setMonth(now.getMonth() - 1);
      }

      result = result.filter((t) => {
        const refDateStr =
          t.status === 'completed' && t.completedAt
            ? t.completedAt
            : t.createdAt || new Date().toISOString();

        const refDate = new Date(refDateStr);
        return refDate >= cutOffDate;
      });
    }

    return result.sort((a, b) => {
      const dateA = a.completedAt
        ? new Date(a.completedAt).getTime()
        : new Date(a.createdAt || 0).getTime();
      const dateB = b.completedAt
        ? new Date(b.completedAt).getTime()
        : new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [tasks, statusFilter, periodFilter]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 py-4">
      {/* Header Responsivo */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-100">
            <CheckCircle2 className="text-blue-500 h-6 w-6" />
            Histórico de Tarefas
          </h2>
          <p className="text-sm text-slate-500">
            Visualize e gerencie o registro de todas as suas atividades.
          </p>
        </div>

        {/* [LAYOUT UPDATE] Grupo de Filtros Responsivo */}
        {/* Mobile: flex-col e w-full (empilhados) */}
        {/* Tablet/Desktop: flex-row e w-auto (lado a lado) */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Filtro de Status */}
          {/* Mobile: w-full. Desktop: w-[180px] para mais espaço de leitura */}
          <div className="w-full ">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="bg-slate-950 border-slate-700 h-10 text-sm focus:ring-blue-500/20 transition-all hover:bg-slate-900">
                <div className="flex items-center gap-2 truncate">
                  <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="completed">Apenas Concluídos</SelectItem>
                <SelectItem value="active">Pendentes / Pausados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Período */}
          <div className="w-full ">
            <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
              <SelectTrigger className="bg-slate-950 border-slate-700 h-10 text-sm focus:ring-blue-500/20 transition-all hover:bg-slate-900">
                <div className="flex items-center gap-2 truncate">
                  <CalendarClock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <SelectValue placeholder="Período" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o Período</SelectItem>
                <SelectItem value="7days">Últimos 7 Dias</SelectItem>
                <SelectItem value="month">Último Mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Lista de Tarefas */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20">
          <Filter className="h-10 w-10 opacity-20 mb-3" />
          <h3 className="text-lg font-medium text-slate-400">Nenhuma tarefa encontrada</h3>
          <p className="text-sm mt-1 max-w-xs text-center">
            Tente ajustar os filtros acima para ver mais resultados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <Badge
              variant="outline"
              className="text-xs font-medium text-slate-500 border-slate-800 bg-slate-900/50"
            >
              {filteredTasks.length} Registros encontrados
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
