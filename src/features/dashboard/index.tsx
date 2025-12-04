import { useState } from 'react';

import { Calendar as CalendarIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { useTaskManager } from '@/hooks/use-task-manager';

import { ActivityList } from './components/activity-list';
import { MetricsCards } from './components/metrics-cards';
import { type DashboardFilter, useDashboardStats } from './hooks/use-dashboard-stats';

export default function DashboardView() {
  const { tasks } = useTaskManager();
  const [filter, setFilter] = useState<DashboardFilter>('day');

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const { stats, activities } = useDashboardStats(tasks, filter, selectedDate);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2">
          {filter === 'day' && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
                <CalendarIcon className="h-3.5 w-3.5" />
              </div>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-8 h-8 bg-slate-950 border-slate-700 w-auto text-xs"
              />
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {(['day', 'week', 'month'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded-md uppercase font-bold transition-all ${
                filter === f
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              {f === 'day' ? 'Dia' : f === 'week' ? '7 Dias' : 'Mês'}
            </button>
          ))}
        </div>
      </div>

      <MetricsCards stats={stats} />

      <ActivityList activities={activities} />
    </div>
  );
}
