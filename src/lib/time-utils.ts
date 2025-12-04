import type { TimeInterval } from '@/types';

export const formatTime = (ms: number) => {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600)
    .toString()
    .padStart(2, '0');
  const m = Math.floor((totalSec % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

export const calculateTotalMs = (intervals: TimeInterval[]) => {
  const nowTs = Date.now();
  return intervals.reduce((acc, interval) => {
    const start = new Date(interval.start).getTime();
    const end = interval.end ? new Date(interval.end).getTime() : nowTs;
    return acc + (end - start);
  }, 0);
};

export const calculateWorkUnits = (ms: number) => (Math.max(0, ms) / (1000 * 60 * 60)).toFixed(2);

export const toLocalInput = (isoString: string | null) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
