// src/components/shared/global-sync-manager.tsx
import { useEffect, useRef } from 'react';

import { doc, onSnapshot } from 'firebase/firestore';
import { useAtom, useAtomValue } from 'jotai';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/use-auth';
import { useCloudSync } from '@/hooks/use-cloud-sync';
import { db } from '@/lib/firebase';
import { decimalSeparatorAtom, syncModeAtom } from '@/store/settings-atoms';
import { tasksAtom } from '@/store/task-atoms';
import type { Task } from '@/types';

export function GlobalSyncManager() {
  const { user } = useAuth();
  const syncMode = useAtomValue(syncModeAtom);

  // Usamos useAtom aqui pois precisaremos "setar" o estado quando vier da nuvem
  const [tasks, setTasks] = useAtom(tasksAtom);
  const [decimalSeparator, setDecimalSeparator] = useAtom(decimalSeparatorAtom);

  const { backup } = useCloudSync(user?.uid);

  // REFS DE CONTROLE (Evitam re-renders e loops)
  const isRemoteUpdate = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(false);

  // 1. LISTENER (Nuvem -> Local)
  useEffect(() => {
    // Só conecta se tiver usuário e estiver em modo automático
    if (!user || syncMode !== 'automatic') return;

    console.log('[Sync] Conectando ao Firestore...');

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (docSnapshot) => {
        if (!docSnapshot.exists()) return;

        const data = docSnapshot.data();
        const remoteBackup = data.backup;

        // Validação básica
        if (!remoteBackup || !Array.isArray(remoteBackup.tasks)) return;

        // Comparação simples para evitar updates desnecessários
        // (Em prod, um hash profundo ou timestamp seria melhor, mas JSON stringify serve para MVP)
        const currentLocalStr = JSON.stringify(tasks);
        const incomingRemoteStr = JSON.stringify(remoteBackup.tasks);

        if (currentLocalStr !== incomingRemoteStr) {
          console.log('[Sync] Atualização recebida da nuvem.');

          // MARCA A FLAG: Isso impede que o useEffect de backup dispare
          isRemoteUpdate.current = true;

          setTasks(remoteBackup.tasks as Task[]);

          // Sincroniza configurações também se existirem
          if (remoteBackup.settings?.decimalSeparator) {
            setDecimalSeparator(remoteBackup.settings.decimalSeparator);
          }

          // Feedback sutil (opcional, pode ser removido se ficar chato)
          // toast.info('Sincronizado com outro dispositivo.');
        }
      },
      (error) => {
        console.error('[Sync Error]', error);
        toast.error('Erro na conexão em tempo real.');
      }
    );

    return () => {
      console.log('[Sync] Desconectando listener.');
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, syncMode, setTasks, setDecimalSeparator]); // "tasks" NÃO vai nas deps para não recriar o listener a cada digitação

  // 2. BACKUP (Local -> Nuvem)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (!user || syncMode !== 'automatic') return;

    // SE A MUDANÇA VEIO DA NUVEM, IGNORA O BACKUP
    if (isRemoteUpdate.current) {
      console.log('[Sync] Mudança remota detectada. Pulando backup (loop prevention).');
      isRemoteUpdate.current = false; // Reseta a flag para as próximas interações manuais
      return;
    }

    // Debounce do Backup (Aguarda usuário parar de digitar/clicar)
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      console.log('[Sync] Enviando alterações locais...');
      backup({ silent: true });
    }, 2000); // Aumentei para 2s para ser menos agressivo no Firestore

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [tasks, decimalSeparator, user, syncMode, backup]);

  return null;
}
