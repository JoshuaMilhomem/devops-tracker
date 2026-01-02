import { useEffect } from 'react';

import { collection, deleteDoc, doc, onSnapshot, query, setDoc } from 'firebase/firestore';
import { useSetAtom } from 'jotai';
import { toast } from 'sonner';

import { db } from '@/lib/firebase';
import { tasksAtom } from '@/store/task-atoms';
import type { Task } from '@/types';

export function useFirestoreRealtime(userId?: string) {
  const setTasks = useSetAtom(tasksAtom);

  useEffect(() => {
    if (!userId) return;

    const q = query(collection(db, 'users', userId, 'tasks'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const remoteTasks: Task[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          remoteTasks.push({ ...data, id: doc.id } as Task);
        });

        setTasks(remoteTasks);
      },
      (error) => {
        console.error('Firestore sync error:', error);
        toast.error('Erro na sincronização em tempo real.');
      }
    );

    return () => unsubscribe();
  }, [userId, setTasks]);

  const saveTaskToCloud = async (task: Task) => {
    if (!userId) return;
    try {
      await setDoc(
        doc(db, 'users', userId, 'tasks', task.id),
        {
          ...task,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.error(e);
      toast.error('Falha ao salvar tarefa na nuvem');
    }
  };

  const deleteTaskFromCloud = async (taskId: string) => {
    if (!userId) return;
    try {
      await deleteDoc(doc(db, 'users', userId, 'tasks', taskId));
    } catch (e) {
      console.error(e);
      toast.error('Erro ao deletar da nuvem');
    }
  };

  return { saveTaskToCloud, deleteTaskFromCloud };
}
