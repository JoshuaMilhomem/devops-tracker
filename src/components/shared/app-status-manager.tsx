import { useEffect, useRef } from 'react';

import { useAtomValue } from 'jotai';

import { calculateTotalMs, formatTime } from '@/lib/time-utils';
import { activeTaskAtom } from '@/store/task-atoms';

const PLAY_ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1447e6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#20028f;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#grad)" />
  <path d="M180 130 L380 256 L180 382 Z" fill="white" />
</svg>
`.trim();

const ACTIVE_FAVICON_URI = `data:image/svg+xml;utf8,${encodeURIComponent(PLAY_ICON_SVG)}`;

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
      link.href = ACTIVE_FAVICON_URI;
    } else {
      link.href = originalFaviconRef.current;
    }

    return () => {
      if (originalFaviconRef.current) link.href = originalFaviconRef.current;
    };
  }, [activeTask]);

  useEffect(() => {
    if (!activeTask) {
      document.title = 'DevOpsTracker';
      return;
    }
    const updateTitle = () => {
      const totalMs = calculateTotalMs(activeTask.intervals);
      document.title = `(${formatTime(totalMs)}) ${activeTask.name}`;
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
