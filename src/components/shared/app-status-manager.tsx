import { useEffect, useRef } from 'react';

import { useAtomValue } from 'jotai';

import { calculateTotalMs, formatTime } from '@/lib/time-utils';
import { activeTaskAtom } from '@/store/task-atoms';

const PLAY_FAVICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23ef4444'/%3E%3Cpath d='M12 10L24 16L12 22Z' fill='white'/%3E%3C/svg%3E`;

export function AppStatusManager() {
  const activeTask = useAtomValue(activeTaskAtom);

  const originalFaviconRef = useRef<string>('');

  useEffect(() => {
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;

    if (!link) return;

    if (!originalFaviconRef.current) {
      originalFaviconRef.current = link.href;
    }

    if (activeTask) {
      link.href = PLAY_FAVICON;
    } else {
      link.href = originalFaviconRef.current;
    }

    return () => {
      if (originalFaviconRef.current) {
        link.href = originalFaviconRef.current;
      }
    };
  }, [activeTask]);

  useEffect(() => {
    if (!activeTask) {
      document.title = 'DevOpsTracker';
      return;
    }

    const updateTitle = () => {
      const totalMs = calculateTotalMs(activeTask.intervals);
      const timeString = formatTime(totalMs);

      document.title = `(${timeString}) ${activeTask.name}`;
    };

    updateTitle();
    const intervalId = setInterval(updateTitle, 1000);

    return () => {
      clearInterval(intervalId);
      document.title = 'DevOpsTracker';
    };
  }, [activeTask]);

  return null;
}
