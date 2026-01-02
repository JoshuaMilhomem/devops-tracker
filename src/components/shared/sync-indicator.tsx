import { useAtomValue } from 'jotai';
import { AlertTriangle, Cloud, CloudOff, RefreshCw } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { lastSyncTimeAtom, syncStatusAtom } from '@/store/ui-atoms';

export function SyncIndicator() {
  const status = useAtomValue(syncStatusAtom);
  const lastSync = useAtomValue(lastSyncTimeAtom);

  if (status === 'idle') return null;

  const getStatusDetails = () => {
    switch (status) {
      case 'syncing':
        return {
          icon: RefreshCw,
          color: 'text-blue-400',
          label: 'Sincronizando...',
          animate: 'animate-spin',
        };
      case 'synced':
        return {
          icon: Cloud,
          color: 'text-emerald-400',
          label: 'Sincronizado',
          animate: '',
        };
      case 'error':
        return {
          icon: AlertTriangle,
          color: 'text-red-400',
          label: 'Erro de Sincronização',
          animate: '',
        };
      case 'offline':
        return {
          icon: CloudOff,
          color: 'text-slate-500',
          label: 'Offline',
          animate: '',
        };
      default:
        return { icon: Cloud, color: 'text-slate-500', label: '', animate: '' };
    }
  };

  const { icon: Icon, color, label, animate } = getStatusDetails();

  const timeLabel = lastSync
    ? `Última atualização: ${lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : label;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border border-slate-800 transition-colors',
              status === 'error' && 'border-red-500/30 bg-red-500/10'
            )}
          >
            <Icon className={cn('w-4 h-4', color, animate)} />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="text-xs bg-slate-900 border-slate-800 text-slate-300"
        >
          <p className="font-bold mb-0.5">{label}</p>
          {status === 'synced' && <p className="text-[10px] text-slate-500">{timeLabel}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
