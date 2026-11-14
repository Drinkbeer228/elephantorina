/**
 * Память о результатах. Хранится в localStorage этого устройства, без аккаунтов и серверов.
 * Старый прогресс курса (`elephantology-edu-progress`) не трогается.
 */
import type { Mode, Summary } from './session';

export const PROGRESS_KEY = 'elephantorina.progress.v2';

export interface QuestionRecord {
  /** Последний ответ верный. */
  ok: boolean;
  /** Сколько раз отвечали. */
  n: number;
  at: string;
}

/** Результаты по книге. Зачётом считается только режим «зачёт»: лучший и последний процент — по зачётам. */
export interface TopicRecord {
  /** Лучший процент на зачёте (0, если зачёт не сдавали). */
  best: number;
  /** Последний процент на зачёте. */
  last: number;
  /** Сколько раз сдавали зачёт. */
  attempts: number;
  /** Зачёт сдан: хотя бы раз от PASS_PERCENT в режиме «зачёт». */
  passed: boolean;
  /** Последняя тренировка, процент. */
  practiceLast?: number;
  /** Время последней попытки любого режима. */
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
 * над ошибками null: тогда обновляются только вопросы. Отметку «зачёт сдан» ставит только режим `exam`.
 */
export function recordSummary(
  p: Progress,
  summary: Summary,
  topic: string | null,
  mode: Mode,
  at = new Date().toISOString(),
): Progress {
  const questions = { ...p.questions };
  for (const g of summary.graded) {
    if (g.item.picked === null) continue;
    const id = g.item.question.id;
    questions[id] = { ok: g.correct, n: (questions[id]?.n ?? 0) + 1, at };
  }
  const topics = { ...p.topics };
  if (topic) {
    const prev: TopicRecord = topics[topic] ?? { best: 0, last: 0, attempts: 0, passed: false, at };
    topics[topic] =
      mode === 'exam'
        ? {
            ...prev,
            best: Math.max(prev.best, summary.percent),
            last: summary.percent,
            attempts: prev.attempts + 1,
            passed: prev.passed || summary.passed,
            at,
          }
        : { ...prev, practiceLast: summary.percent, at };
  }
  return { questions, topics };
}

/** id вопросов, на которые уже отвечали (верно или нет). */
export function seen(p: Progress): Set<string> {
  return new Set(Object.keys(p.questions));
}

// ── перенос между устройствами ──

export const EXPORT_APP = 'elephantorina';

export function exportProgress(p: Progress, at = new Date().toISOString()): string {
  return JSON.stringify({ app: EXPORT_APP, version: 2, exportedAt: at, progress: p }, null, 2);
}

/** Разбирает файл экспорта. Бросает Error с понятным текстом, если файл не тот. */
export function parseExport(text: string): Progress {
  let x: unknown;
  try {
    x = JSON.parse(text);
  } catch {
    throw new Error('Это не JSON-файл.');
  }
  const o = x as { app?: unknown; version?: unknown; progress?: { questions?: unknown; topics?: unknown } };
  if (!o || o.app !== EXPORT_APP || !o.progress || typeof o.progress.questions !== 'object' || typeof o.progress.topics !== 'object') {
    throw new Error('Это не файл прогресса Elephantorina.');
  }
  if (o.version !== 2) throw new Error(`Неизвестная версия файла: ${String(o.version)}.`);
  return parseProgress(JSON.stringify(o.progress));
}

/**
 * Объединяет прогресс двух устройств, ничего не теряя: у вопроса берётся более поздний ответ
 * (счётчики складываются по максимуму), у книги — лучший результат и сданный зачёт с любого устройства.
 */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const questions: Record<string, QuestionRecord> = { ...a.questions };
  for (const [id, r] of Object.entries(b.questions)) {
    const mine = questions[id];
    if (!mine) questions[id] = r;
    else {
      const later = r.at > mine.at ? r : mine;
      questions[id] = { ...later, n: Math.max(mine.n, r.n) };
    }
  }
  const topics: Record<string, TopicRecord> = { ...a.topics };
  for (const [id, r] of Object.entries(b.topics)) {
    const mine = topics[id];
    if (!mine) topics[id] = r;
    else {
      const later = r.at > mine.at ? r : mine;
      topics[id] = {
        best: Math.max(mine.best, r.best),
        last: later.last,
        attempts: Math.max(mine.attempts, r.attempts),
        passed: mine.passed || r.passed,
        practiceLast: later.practiceLast ?? mine.practiceLast ?? r.practiceLast,
        at: later.at,
      };
    }
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
