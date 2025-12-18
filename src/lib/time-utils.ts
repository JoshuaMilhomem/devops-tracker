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
/**
 * Calcula Story Points baseado na duração em milissegundos.
 * Regra: Fibonacci adaptado às horas trabalhadas.
 */
export function calculateStoryPoints(ms: number): number {
  const hours = ms / (1000 * 60 * 60);
  if (hours <= 0) return 0;
  if (hours < 1 && ms > 0) return 1;
  if (hours < 2) return 1;
  if (hours < 4) return 2;
  if (hours < 8) return 3;
  if (hours < 16) return 5;
  if (hours < 24) return 8;
  return 13;
}
