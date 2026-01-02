import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAtomValue } from 'jotai';
import { AlertCircle, Cloud, CloudOff, HardDrive, RefreshCw } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { syncModeAtom } from '@/store/settings-atoms';
import { lastSyncTimeAtom, syncStatusAtom } from '@/store/ui-atoms';

import { Button } from '../ui/button';

export function SyncIndicator() {
  const status = useAtomValue(syncStatusAtom);
  const lastSync = useAtomValue(lastSyncTimeAtom);
  const syncMode = useAtomValue(syncModeAtom);

  const getStatusConfig = () => {
    if (syncMode === 'manual') {
      return {
        icon: HardDrive,
        color: 'text-muted-foreground',
        text: 'Modo Manual (Local)',
        desc: 'As alterações não sobem automaticamente.',
      };
    }

    switch (status) {
      case 'syncing':
        return {
          icon: RefreshCw,
          color: 'text-blue-500 animate-spin',
          text: 'Sincronizando...',
          desc: 'Enviando alterações...',
        };
      case 'synced':
        return {
          icon: Cloud,
          color: 'text-green-500',
          text: 'Sincronizado',
          desc: lastSync
            ? `Última atualização: ${format(lastSync, 'HH:mm:ss', { locale: ptBR })}`
            : 'Tudo atualizado',
        };
      case 'offline':
        return {
          icon: CloudOff,
          color: 'text-amber-500',
          text: 'Offline (Cache)',
          desc: 'Usando dados locais. Sincronizará ao reconectar.',
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          text: 'Erro de Sincronização',
          desc: 'Verifique sua conexão ou login.',
        };
      case 'idle':
      default:
        return {
          icon: CloudOff,
          color: 'text-muted-foreground/50',
          text: 'Desconectado',
          desc: 'Faça login para sincronizar.',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant={'ghost'}
            size={'icon-lg'}
            className={cn('transition-colors hover:bg-muted/50', config.color)}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent align="end">
          <div className="flex flex-col gap-1">
            <p className="font-semibold">{config.text}</p>
            <p className="text-xs text-muted-foreground">{config.desc}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
