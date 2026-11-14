/**
 * Сводка для формуляра станции: ключ `ers_progress_v1:elephantorina`, схема `ers.progress/1`
 * (research-station: docs/station/CONTRACT.md, §2). Только id книги, статус, дата и лучший процент зачёта.
 * Пишет только этот модуль; собственный прогресс (`elephantorina.progress.v2`) остаётся источником правды.
 */
import type { Progress } from '../test/progress';

export const STATION_PROGRESS_KEY = 'ers_progress_v1:elephantorina';
const MAX_ITEMS = 500;

export interface StationItem { kind: 'quiz'; status: 'started' | 'done'; at: string; score?: number; ref: { book: string } }
export interface StationSummary { schema: 'ers.progress/1'; module: 'elephantorina'; updatedAt: string; items: Record<string, StationItem> }

/** Книга — один элемент: «done», когда зачёт сдан; «started» после любой попытки. */
export function toStationSummary(p: Progress, now = new Date().toISOString()): StationSummary {
  const items: Record<string, StationItem> = {};
  const topics = Object.entries(p.topics)
    .sort((a, b) => (a[1].at < b[1].at ? 1 : -1))
    .slice(0, MAX_ITEMS);
  for (const [book, t] of topics) {
    const item: StationItem = { kind: 'quiz', status: t.passed ? 'done' : 'started', at: t.at, ref: { book } };
    if (t.attempts > 0) item.score = t.best;
    items[book] = item;
  }
  const updatedAt = topics.length ? topics[0][1].at : now;
  return { schema: 'ers.progress/1', module: 'elephantorina', updatedAt, items };
}

export function writeStationSummary(p: Progress, storage?: Pick<Storage, 'setItem'>): void {
  try {
    const s = storage ?? (typeof localStorage === 'undefined' ? undefined : localStorage);
    s?.setItem(STATION_PROGRESS_KEY, JSON.stringify(toStationSummary(p)));
  } catch {
    /* нет места или память закрыта — станция просто не увидит сводку */
  }
}
