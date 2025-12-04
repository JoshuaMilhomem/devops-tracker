import { Activity } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { calculateWorkUnits, formatTime } from '@/lib/time-utils';

import type { DashboardActivity } from '../hooks/use-dashboard-stats';

interface ActivityListProps {
  activities: DashboardActivity[];
}

export function ActivityList({ activities }: ActivityListProps) {
  return (
    <Card className="border-slate-800 bg-slate-900/20">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
          <Activity className="h-4 w-4 text-blue-500" />
          Atividades Realizadas
        </h3>
        <Badge variant="outline" className="text-xs text-slate-500 border-slate-800">
          {activities.length} itens
        </Badge>
      </div>

      {activities.length === 0 ? (
        <div className="p-8 text-center text-slate-600 text-sm">
          Nenhuma atividade registrada neste período.
        </div>
      ) : (
        <div className="divide-y divide-slate-800/50">
          {activities.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 hover:bg-slate-900/40 transition-colors"
            >
              <div className="min-w-0 flex-1 flex items-center gap-3">
                <div
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-300 truncate">{task.name}</span>
                    {task.storyPoints > 0 && (
                      <span className="text-[10px] text-slate-500 border border-slate-800 px-1 rounded bg-slate-950">
                        {task.storyPoints} SP
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 text-xs pl-4">
                <span className="text-slate-500 font-mono w-16 text-right">
                  {formatTime(task.durationInPeriod)}
                </span>
                <div className="w-16 text-right">
                  <span className="text-blue-400 font-bold font-mono">
                    {calculateWorkUnits(task.durationInPeriod)} WT
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
