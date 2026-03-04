import axios from 'axios';
import { NAME_COLORS } from '../constants';

export function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getColorForUser(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return NAME_COLORS[Math.abs(hash) % NAME_COLORS.length];
}

export function extractAxiosError(err: unknown, fallback: string): string {
  if (axios.isAxiosError<{ error?: string }>(err)) {
    return err.response?.data?.error || fallback;
  }
  return fallback;
}
