import { useState } from 'react';

import { collection, doc, getDoc, getDocs, query, writeBatch } from 'firebase/firestore';
import { useAtomCallback } from 'jotai/utils';
import { toast } from 'sonner';

import { db } from '@/lib/firebase';
//
import { decimalSeparatorAtom } from '@/store/settings-atoms';
//
import { tasksAtom } from '@/store/task-atoms';
//
import type { Task } from '@/types';

//

export function useCloudSync(userId?: string) {
  const [isSyncing, setIsSyncing] = useState(false);

  const backup = useAtomCallback(async (get, _set, options?: { silent?: boolean }) => {
    if (!userId) {
      if (!options?.silent) toast.error('Login necessário.');
      return;
    }
    setIsSyncing(true);

    try {
      const localTasks = get(tasksAtom);
      const localSeparator = get(decimalSeparatorAtom);

      const batch = writeBatch(db);

      localTasks.forEach((task) => {
        const ref = doc(db, 'users', userId, 'tasks', task.id);
        batch.set(ref, { ...task, updatedAt: new Date().toISOString() }, { merge: true });
      });

      const userRef = doc(db, 'users', userId);
      batch.set(userRef, { settings: { decimalSeparator: localSeparator } }, { merge: true });

      await batch.commit();

      if (!options?.silent) toast.success(`Backup enviado! ${localTasks.length} tarefas na nuvem.`);
    } catch (error) {
      console.error('Falha no upload:', error);
      if (!options?.silent) toast.error('Erro ao enviar dados.');
    } finally {
      setIsSyncing(false);
    }
  });

  const restore = useAtomCallback(async (_get, set) => {
    if (!userId) return;
    setIsSyncing(true);

    try {
      const q = query(collection(db, 'users', userId, 'tasks'));
      const snapshot = await getDocs(q);

      const cloudTasks: Task[] = [];
      snapshot.forEach((doc) => {
        cloudTasks.push({ ...doc.data(), id: doc.id } as Task);
      });

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.settings?.decimalSeparator) {
          set(decimalSeparatorAtom, data.settings.decimalSeparator);
        }
      }

      if (cloudTasks.length > 0) {
        set(tasksAtom, cloudTasks);
        toast.success(`${cloudTasks.length} tarefas baixadas.`);
      } else {
        toast.info('Nenhuma tarefa encontrada na nuvem.');
      }
    } catch (error) {
      console.error('Restore failed:', error);
      toast.error('Falha ao baixar dados.');
    } finally {
      setIsSyncing(false);
    }
  });

  const smartMerge = useAtomCallback(async (get, _set) => {
    if (!userId) {
      toast.error('Você precisa estar logado.');
      return;
    }
    setIsSyncing(true);

    try {
      const localTasks = get(tasksAtom);
      const localSeparator = get(decimalSeparatorAtom);

      const tasksRef = collection(db, 'users', userId, 'tasks');
      const snapshot = await getDocs(query(tasksRef));

      const cloudTasksMap = new Map<string, Task>();
      snapshot.forEach((doc) => {
        cloudTasksMap.set(doc.id, { ...doc.data(), id: doc.id } as Task);
      });

      const batch = writeBatch(db);
      let updatesCount = 0;

      localTasks.forEach((localTask) => {
        const cloudTask = cloudTasksMap.get(localTask.id);

        const localTime = new Date(localTask.updatedAt || 0).getTime();
        const cloudTime = cloudTask ? new Date(cloudTask.updatedAt || 0).getTime() : 0;

        if (!cloudTask || localTime > cloudTime) {
          const docRef = doc(db, 'users', userId, 'tasks', localTask.id);
          batch.set(docRef, localTask, { merge: true });
          updatesCount++;
        }
      });

      const userRef = doc(db, 'users', userId);
      batch.set(
        userRef,
        {
          settings: { decimalSeparator: localSeparator },
          lastSmartMerge: new Date().toISOString(),
        },
        { merge: true }
      );

      if (updatesCount > 0) {
        await batch.commit();
        toast.success(`Mesclagem: ${updatesCount} tarefas locais enviadas para a nuvem.`);
      } else {
        toast.info('Seus dados locais já estão em sincronia com a nuvem.');
      }
    } catch (error) {
      console.error('Smart Merge failed:', error);
      toast.error('Erro na mesclagem inteligente.');
    } finally {
      setIsSyncing(false);
    }
  });

  return { isSyncing, backup, restore, smartMerge };
}
