import { BarChart3, CheckCircle, Clock } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { formatTime } from '@/lib/time-utils';

interface MetricsCardsProps {
  stats: {
    hours: number;
    wt: number;
    sp: number;
  };
}

export function MetricsCards({ stats }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 flex flex-col items-center justify-center bg-slate-900 border-slate-800">
        <Clock className="h-8 w-8 mb-4 text-blue-400" />
        <div className="text-3xl font-bold text-slate-100 font-mono">{formatTime(stats.hours)}</div>
        <div className="text-xs text-slate-500 font-medium uppercase mt-1">Tempo Total</div>
      </Card>

      <Card className="p-6 flex flex-col items-center justify-center bg-slate-900 border-slate-800">
        <BarChart3 className="h-8 w-8 mb-4 text-emerald-400" />
        <div className="text-3xl font-bold text-slate-100 font-mono">{stats.wt.toFixed(2)}</div>
        <div className="text-xs text-slate-500 font-medium uppercase mt-1">Unidades (WT)</div>
      </Card>

      <Card className="p-6 flex flex-col items-center justify-center bg-slate-900 border-slate-800">
        <CheckCircle className="h-8 w-8 mb-4 text-purple-400" />
        <div className="text-3xl font-bold text-slate-100 font-mono">{stats.sp}</div>
        <div className="text-xs text-slate-500 font-medium uppercase mt-1">Story Points</div>
      </Card>
    </div>
  );
}
