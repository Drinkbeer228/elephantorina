/**
 * Память о результатах. Хранится в localStorage этого устройства, без аккаунтов и серверов.
 * Старый прогресс курса (`elephantology-edu-progress`) не трогается.
 */
import type { Summary } from './session';

export const PROGRESS_KEY = 'elephantorina.progress.v2';

export interface QuestionRecord {
  /** Последний ответ верный. */
  ok: boolean;
  /** Сколько раз отвечали. */
  n: number;
  at: string;
}

export interface TopicRecord {
  best: number;
  last: number;
  attempts: number;
  passed: boolean;
  at: string;
}

export interface Progress {
  questions: Record<string, QuestionRecord>;
  topics: Record<string, TopicRecord>;
}

export const emptyProgress = (): Progress => ({ questions: {}, topics: {} });

export function parseProgress(raw: string | null): Progress {
  if (!raw) return emptyProgress();
  try {
    const x = JSON.parse(raw);
    if (x && typeof x === 'object' && x.questions && x.topics) return { questions: { ...x.questions }, topics: { ...x.topics } };
  } catch {
    /* повреждённые данные — начинаем заново */
  }
  return emptyProgress();
}

export function loadProgress(storage: Pick<Storage, 'getItem'> | undefined = safeStorage()): Progress {
  try {
    return parseProgress(storage?.getItem(PROGRESS_KEY) ?? null);
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(p: Progress, storage: Pick<Storage, 'setItem'> | undefined = safeStorage()): void {
  try {
    storage?.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* приватный режим или нет места — результат просто не запомнится */
  }
}

function safeStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

/**
 * Записывает итог теста. `topic` — id книги для теста по одной книге; для смешанных тестов и работы
 * над ошибками null: тогда обновляются только вопросы.
 */
export function recordSummary(p: Progress, summary: Summary, topic: string | null, at = new Date().toISOString()): Progress {
  const questions = { ...p.questions };
  for (const g of summary.graded) {
    if (g.item.picked === null) continue;
    const id = g.item.question.id;
    questions[id] = { ok: g.correct, n: (questions[id]?.n ?? 0) + 1, at };
  }
  const topics = { ...p.topics };
  if (topic) {
    const prev = topics[topic];
    topics[topic] = {
      best: Math.max(prev?.best ?? 0, summary.percent),
      last: summary.percent,
      attempts: (prev?.attempts ?? 0) + 1,
      passed: (prev?.passed ?? false) || summary.passed,
      at,
    };
  }
  return { questions, topics };
}

/** id вопросов, на которые в последний раз ответили неверно. */
export function mistakes(p: Progress): Set<string> {
  return new Set(Object.entries(p.questions).filter(([, r]) => !r.ok).map(([id]) => id));
}

export type TopicStatus = 'new' | 'started' | 'passed';

export function topicStatus(p: Progress, book: string): TopicStatus {
  const t = p.topics[book];
  if (!t) return 'new';
  return t.passed ? 'passed' : 'started';
}
