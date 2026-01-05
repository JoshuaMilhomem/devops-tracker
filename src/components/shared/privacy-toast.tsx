import { useEffect } from 'react';

import { useSetAtom } from 'jotai';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { settingsModalOpenAtom, settingsModalTabAtom } from '@/store/ui-atoms';

export function PrivacyToast() {
  const setSettingsOpen = useSetAtom(settingsModalOpenAtom);
  const setSettingsTab = useSetAtom(settingsModalTabAtom);

  useEffect(() => {
    const hasAck = localStorage.getItem('devops-tracker-privacy-ack');

    if (!hasAck) {
      const timer = setTimeout(() => {
        toast('Privacidade & Transparência', {
          description: 'Não utilizamos cookies de rastreamento. Seus dados são salvos localmente.',
          duration: Infinity,
          icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
          action: {
            label: 'Entendi',
            onClick: () => localStorage.setItem('devops-tracker-privacy-ack', 'true'),
          },
          cancel: {
            label: 'Ler Termos',
            onClick: () => {
              setSettingsTab('legal');
              setSettingsOpen(true);
            },
          },
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [setSettingsOpen, setSettingsTab]);

  return null;
}
