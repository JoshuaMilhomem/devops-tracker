import { useState } from 'react';

import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useAtomCallback } from 'jotai/utils';
import { toast } from 'sonner';

import { db } from '@/lib/firebase';
import { type DecimalSeparator, decimalSeparatorAtom } from '@/store/settings-atoms';
import { tasksAtom } from '@/store/task-atoms';
import type { Task } from '@/types';

interface BackupPayload {
  tasks: Task[];
  settings: {
    decimalSeparator: DecimalSeparator;
  };
  version: number;
  updatedAt: any;
}

interface BackupOptions {
  silent?: boolean;
}

export function useCloudSync(userId?: string) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const backup = useAtomCallback(async (get, set, options?: BackupOptions) => {
    if (!userId) {
      if (!options?.silent) toast.error('Você precisa estar logado para fazer backup.');
      return;
    }
    setIsSyncing(true);

    try {
      const rawTasks = get(tasksAtom);
      const decimalSeparator = get(decimalSeparatorAtom);
      const cleanTasks = JSON.parse(JSON.stringify(rawTasks));

      const payload: BackupPayload = {
        tasks: cleanTasks,
        settings: { decimalSeparator },
        version: 1,
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', userId), { backup: payload }, { merge: true });

      setLastSyncTime(new Date());
      if (!options?.silent)
        toast.success('Backup enviado! A nuvem foi atualizada com seus dados locais.');
    } catch (error) {
      console.error('Backup failed:', error);
      if (!options?.silent) toast.error('Falha ao salvar backup.');
    } finally {
      setIsSyncing(false);
    }
  });

  const restore = useAtomCallback(async (_get, set) => {
    if (!userId) return;
    setIsSyncing(true);

    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const backup = data.backup as Partial<BackupPayload>;

        if (backup && Array.isArray(backup.tasks)) {
          set(tasksAtom, backup.tasks);
          set(decimalSeparatorAtom, backup.settings?.decimalSeparator || 'system');
          toast.success(`Dados baixados! Seu local foi substituído pela nuvem.`);
        } else {
          toast.warning('Nenhum backup válido encontrado na nuvem.');
        }
      } else {
        toast.info('Nenhum dado encontrado na nuvem para este usuário.');
      }
    } catch (error) {
      console.error('Restore failed:', error);
      toast.error('Falha ao restaurar dados.');
    } finally {
      setIsSyncing(false);
    }
  });

  const smartMerge = useAtomCallback(async (get, set) => {
    if (!userId) {
      toast.error('Você precisa estar logado.');
      return;
    }
    setIsSyncing(true);

    try {
      const localTasks = get(tasksAtom);
      const localSeparator = get(decimalSeparatorAtom);

      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      let cloudTasks: Task[] = [];
      if (docSnap.exists()) {
        const data = docSnap.data();
        const backup = data.backup as Partial<BackupPayload>;
        if (backup && Array.isArray(backup.tasks)) {
          cloudTasks = backup.tasks;
        }
      }

      const tasksMap = new Map<string, Task>();

      cloudTasks.forEach((t) => tasksMap.set(t.id, t));

      localTasks.forEach((t) => tasksMap.set(t.id, t));

      const mergedTasks = Array.from(tasksMap.values());

      set(tasksAtom, mergedTasks);

      const cleanTasks = JSON.parse(JSON.stringify(mergedTasks));
      const payload: BackupPayload = {
        tasks: cleanTasks,
        settings: { decimalSeparator: localSeparator },
        version: 1,
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', userId), { backup: payload }, { merge: true });

      setLastSyncTime(new Date());
      toast.success(`Sincronização combinada com sucesso! (${mergedTasks.length} tarefas)`);
    } catch (error) {
      console.error('Merge failed:', error);
      toast.error('Erro ao mesclar dados.');
    } finally {
      setIsSyncing(false);
    }
  });

  return { isSyncing, lastSyncTime, backup, restore, smartMerge };
}
