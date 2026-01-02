import { useMemo, useState } from 'react';

import { Activity, CalendarRange, Copy, FileText, Filter } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWorkUnitFormatter } from '@/hooks/use-work-units-formatter';
import { calculateStoryPoints, calculateWorkUnits, formatTime } from '@/lib/time-utils';

import type { DashboardActivity, DashboardFilter } from '../hooks/use-dashboard-stats';

export interface Tag {
  id: string;
  label: string;
  color: string;
}

type ActivityWithTags = Omit<DashboardActivity, 'tags'> & {
  tags?: Tag[];
};

interface ActivityListProps {
  activities: ActivityWithTags[];
  currentFilter: DashboardFilter;
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
};

const getTaskDateRange = (task: ActivityWithTags): string | null => {
  if (!task.intervals || task.intervals.length === 0) return null;

  const timestamps = task.intervals.flatMap((i) => {
    const start = new Date(i.start).getTime();
    const end = i.end ? new Date(i.end).getTime() : Date.now();
    return [start, end];
  });

  if (timestamps.length === 0) return null;

  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);

  const startDate = new Date(minTime);
  const endDate = new Date(maxTime);

  if (startDate.toDateString() === endDate.toDateString()) {
    return formatDate(startDate);
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

export function ActivityList({ activities, currentFilter }: ActivityListProps) {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const { format: formatWT } = useWorkUnitFormatter();
  const uniqueTags = useMemo(() => {
    const tagsMap = new Map<string, Tag>();
    activities.forEach((task) => {
      task.tags?.forEach((tag) => {
        if (!tagsMap.has(tag.label)) {
          tagsMap.set(tag.label, tag);
        }
      });
    });
    return Array.from(tagsMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [activities]);

  const filteredActivities = useMemo(() => {
    if (selectedTag === 'all') return activities;
    return activities.filter((task) => task.tags?.some((t) => t.label === selectedTag));
  }, [activities, selectedTag]);

  const showDateRange = currentFilter !== 'day';
  return (
    <Card className="border-slate-800 bg-slate-900/20 flex flex-col h-full">
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
          <Activity className="h-4 w-4 text-blue-500" />
          Atividades Realizadas
          <Badge
            variant="outline"
            className="ml-2 text-xs text-slate-500 border-slate-800 bg-slate-900"
          >
            {filteredActivities.length}
          </Badge>
        </h3>

        {uniqueTags.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="h-3 w-3 text-slate-500" />
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="h-7 w-40 text-xs bg-slate-950 border-slate-800 focus:ring-slate-700">
                <SelectValue placeholder="Filtrar por tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Tags</SelectItem>
                {uniqueTags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.label}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${tag.color}`} />
                      {tag.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {filteredActivities.length === 0 ? (
        <div className="p-12 flex flex-col items-center justify-center text-slate-600 text-sm gap-2">
          <Filter className="h-8 w-8 opacity-20" />
          <p>Nenhuma atividade encontrada.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/50">
          {filteredActivities.map((task) => {
            const dateRange = showDateRange ? getTaskDateRange(task) : null;
            const currentSp = calculateStoryPoints(task.durationInPeriod);
            const workUnits = calculateWorkUnits(task.durationInPeriod).toString();
            const handleCopy = () => {
              const formattedValue = formatWT(task.durationInPeriod);
              navigator.clipboard.writeText(formattedValue);
              toast.info(`Work Units (${formattedValue}) copiado!`);
            };

            return (
              <div
                key={task.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-900/40 transition-all duration-200"
              >
                <div className="min-w-0 flex-1 flex gap-3">
                  <div className="pt-1.5">
                    <div
                      className={`w-2 h-2 rounded-full ring-2 ring-slate-900 ${
                        task.status === 'completed'
                          ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                          : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                        {task.name}
                      </span>

                      {currentSp > 0 && (
                        <span className="text-[10px] font-bold text-purple-500 border border-purple-500/30 px-1.5 py-0.5 rounded bg-purple-500/10">
                          {currentSp} SP
                        </span>
                      )}
                      {dateRange && (
                        <span className="flex items-center gap-1 text-[10px] text-slate-500 font-mono bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-800/50 ml-1">
                          <CalendarRange className="h-3 w-3 opacity-70" />
                          {dateRange}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <div className="flex items-start gap-1.5 text-xs text-slate-500 max-w-[90%]">
                        <FileText className="h-3 w-3 mt-0.5 shrink-0 opacity-50" />
                        <p className="line-clamp-1 group-hover:line-clamp-2 transition-all duration-300">
                          {task.description}
                        </p>
                      </div>
                    )}

                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {task.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className={`
                              ${tag.color} 
                              text-white/90 
                              hover:${tag.color} 
                              border-0 
                              px-1.5 py-0 h-5 
                              text-[10px] font-medium 
                              rounded-md
                            `}
                          >
                            {tag.label}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 mt-3 sm:mt-0 pl-0 sm:pl-4 border-t sm:border-t-0 border-slate-800/50 pt-3 sm:pt-0">
                  <div className="flex flex-col items-end w-20">
                    <span className="text-[10px] uppercase text-slate-600 font-bold tracking-wider">
                      Tempo
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {formatTime(task.durationInPeriod)}
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase text-slate-600 font-bold tracking-wider">
                      Unidades
                    </span>
                    <div className="flex items-center">
                      <span className="text-sm text-blue-400 font-bold font-mono">
                        {workUnits} WT{' '}
                      </span>
                      <Button
                        variant={'ghost'}
                        size={'icon-sm'}
                        className="p-0 ml-1 opacity-70 hover:opacity-100"
                        onClick={handleCopy}
                      >
                        <Copy size={14} className="inline-block ml-1 mb-0.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
