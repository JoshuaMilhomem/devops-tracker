import { useEffect, useRef } from 'react';

import { useAtomValue } from 'jotai';

import { useAuth } from '@/hooks/use-auth';
import { useCloudSync } from '@/hooks/use-cloud-sync';
import { syncModeAtom } from '@/store/settings-atoms';
import { tasksAtom } from '@/store/task-atoms';

export function GlobalSyncManager() {
  const { user } = useAuth();
  const syncMode = useAtomValue(syncModeAtom);
  const tasks = useAtomValue(tasksAtom);
  const { backup } = useCloudSync(user?.uid);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (user && syncMode === 'automatic') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        console.log('[AutoSync] Iniciando sincronização silenciosa...');
        backup({ silent: true });
      }, 5000);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [tasks, user, syncMode, backup]);

  return null;
}
