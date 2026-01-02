import { useEffect } from 'react';

import { type FirestoreError, collection, onSnapshot, query } from 'firebase/firestore';
import { useAtomValue, useSetAtom } from 'jotai';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { syncModeAtom } from '@/store/settings-atoms';
import { tasksAtom } from '@/store/task-atoms';
import { lastSyncTimeAtom, syncStatusAtom } from '@/store/ui-atoms';
import type { Task } from '@/types';

export function GlobalSyncManager() {
  const { user } = useAuth();

  const setTasks = useSetAtom(tasksAtom);
  const setSyncStatus = useSetAtom(syncStatusAtom);
  const setLastSync = useSetAtom(lastSyncTimeAtom);
  const syncMode = useAtomValue(syncModeAtom);

  useEffect(() => {
    if (!user || syncMode === 'manual') {
      setSyncStatus('idle');
      return;
    }

    setSyncStatus('syncing');

    const tasksCollectionRef = collection(db, 'users', user.uid, 'tasks');
    const q = query(tasksCollectionRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const remoteTasks: Task[] = [];
        snapshot.forEach((doc) => {
          remoteTasks.push({ ...doc.data(), id: doc.id } as Task);
        });

        remoteTasks.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setTasks(remoteTasks);
        setLastSync(new Date());

        const isBrowserOffline = typeof navigator !== 'undefined' && !navigator.onLine;

        if (snapshot.metadata.fromCache && isBrowserOffline) {
          setSyncStatus('offline');
        } else {
          setSyncStatus('synced');
        }
      },
      (error: FirestoreError) => {
        console.error('[Realtime Error]', error);

        if (error.code !== 'permission-denied') {
          toast.error('Erro na sincronização em tempo real.');
        }
        setSyncStatus('error');
      }
    );

    return () => {
      unsubscribe();
      setSyncStatus('idle');
    };
  }, [user, syncMode, setTasks, setSyncStatus, setLastSync]);

  return null;
}
