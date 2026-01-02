import { useEffect, useRef } from 'react';

import { doc, onSnapshot } from 'firebase/firestore';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import { useAuth } from '@/hooks/use-auth';
import { useCloudSync } from '@/hooks/use-cloud-sync';
import { db } from '@/lib/firebase';
import { syncModeAtom } from '@/store/settings-atoms';
import { tasksAtom } from '@/store/task-atoms';
import { lastSyncTimeAtom, syncStatusAtom } from '@/store/ui-atoms';
import { type Task, backupSchema } from '@/types';


const mergeTasks = (localTasks: Task[], remoteTasks: Task[]): Task[] => {
  const mergedMap = new Map<string, Task>();

  
  localTasks.forEach((t) => mergedMap.set(t.id, t));

  
  remoteTasks.forEach((remoteTask) => {
    const localTask = mergedMap.get(remoteTask.id);

    if (!localTask) {
      mergedMap.set(remoteTask.id, remoteTask);
    } else {
      
      const localDate = new Date(localTask.updatedAt || 0).getTime();
      const remoteDate = new Date(remoteTask.updatedAt || 0).getTime();

      
      if (remoteDate >= localDate) {
        mergedMap.set(remoteTask.id, remoteTask);
      }
    }
  });

  return Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export function GlobalSyncManager() {
  const { user } = useAuth();
  const syncMode = useAtomValue(syncModeAtom);
  const [tasks, setTasks] = useAtom(tasksAtom);

  
  
  
  const setSyncStatus = useSetAtom(syncStatusAtom);
  const setLastSync = useSetAtom(lastSyncTimeAtom);

  
  const { backup } = useCloudSync(user?.uid);

  const isRemoteUpdate = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  
  useEffect(() => {
    if (!user || syncMode !== 'automatic') return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (docSnapshot) => {
        if (!docSnapshot.exists()) return;

        const data = docSnapshot.data();
        const validation = backupSchema.safeParse(data.backup?.tasks);

        if (!validation.success) return;
        const remoteTasks = validation.data;

        setTasks((currentLocalTasks) => {
          
          if (currentLocalTasks.length === 0 && remoteTasks.length === 0) return currentLocalTasks;

          const currentStr = JSON.stringify(currentLocalTasks);
          const remoteStr = JSON.stringify(remoteTasks);

          
          if (currentStr === remoteStr) {
            setSyncStatus('synced');
            return currentLocalTasks;
          }

          console.log('[Sync] Dados novos detectados. Mesclando...');
          const mergedTasks = mergeTasks(currentLocalTasks, remoteTasks);
          const mergedStr = JSON.stringify(mergedTasks);

          
          
          if (mergedStr === remoteStr) {
            isRemoteUpdate.current = true;
            setSyncStatus('synced');
            setLastSync(new Date());
          } else {
            
            
            isRemoteUpdate.current = false;
          }

          return mergedTasks;
        });
      },
      (error) => {
        console.error('[Sync Error]', error);
        setSyncStatus('error');
      }
    );

    return () => unsubscribe();
  }, [user, syncMode, setTasks, setSyncStatus, setLastSync]);

  
  useEffect(() => {
    if (!user || syncMode !== 'automatic') return;

    
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    setSyncStatus('syncing');

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    
    timeoutRef.current = setTimeout(async () => {
      try {
        await backup({ silent: true });
        setSyncStatus('synced');
        setLastSync(new Date());
      } catch (_error) {
        console.error('[Sync Backup Error]', _error);
        setSyncStatus('error');
      }
    }, 2000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [tasks, user, syncMode, backup, setSyncStatus, setLastSync]);

  return null;
}
