/**
 * Сессия теста: выбор вопросов, перемешивание вариантов, приём ответов и итог. Без React и без хранилища.
 */
import type { Question } from '../bank/types';

export type Mode = 'practice' | 'exam';

/** Вопрос в сессии: варианты перемешаны, `order[i]` — индекс варианта в исходном вопросе. */
export interface SessionItem {
  question: Question;
  order: number[];
  /** Выбранный вариант (индекс в перемешанном порядке) или null. */
  picked: number | null;
}

export interface Session {
  mode: Mode;
  items: SessionItem[];
  index: number;
  startedAt: number;
}

export interface Graded {
  item: SessionItem;
  correct: boolean;
  /** Текст выбранного варианта или null, если ответа нет. */
  pickedText: string | null;
  correctText: string;
  /** Пояснение к выбранному (или правильному) варианту. */
  note: string;
}

export interface Summary {
  total: number;
  correct: number;
  percent: number;
  passed: boolean;
  graded: Graded[];
  durationMs: number;
}

export const PASS_PERCENT = 80;
export const DEFAULT_SIZE = 12;

/** Детерминированный генератор для перемешивания (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(xs: readonly T[], rand: () => number): T[] {
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function optionCount(q: Question): number {
  return q.options.length;
}

export function optionText(q: Question, original: number): string {
  return q.kind === 'choice' ? q.options[original] ?? '' : q.options[original]?.text ?? '';
}

export function isCorrectOriginal(q: Question, original: number): boolean {
  return q.kind === 'choice' ? q.answer === original : !!q.options[original]?.correct;
}

export function correctOriginal(q: Question): number {
  return q.kind === 'choice' ? q.answer : Math.max(0, q.options.findIndex((o) => o.correct));
}

/**
 * Собирает сессию до `size` вопросов (по умолчанию 12; если в пуле меньше — берутся все).
 * Порядок отбора: сначала вопросы с ошибкой в прошлый раз (`weak`), затем ещё не пройденные
 * (нет в `seen`), затем остальные; внутри групп — случайно. Варианты ответа перемешиваются.
 */
export function createSession(
  pool: readonly Question[],
  opts: { mode: Mode; size?: number; seed?: number; weak?: ReadonlySet<string>; seen?: ReadonlySet<string> },
): Session {
  const rand = rng(opts.seed ?? Date.now());
  const size = Math.max(1, Math.min(opts.size ?? DEFAULT_SIZE, pool.length));
  const weak = opts.weak ?? new Set<string>();
  const seen = opts.seen;
  const rank = (q: Question) => (weak.has(q.id) ? 0 : seen && !seen.has(q.id) ? 1 : 2);
  const groups: Question[][] = [[], [], []];
  for (const q of pool) groups[rank(q)]!.push(q);
  const picked = groups.flatMap((g) => shuffle(g, rand)).slice(0, size);
  // Внутри выбранного порядок снова случайный, чтобы приоритетные не шли всегда в начале.
  const items = shuffle(picked, rand).map((question) => ({
    question,
    order: shuffle(
      Array.from({ length: optionCount(question) }, (_, i) => i),
      rand,
    ),
    picked: null,
  }));
  return { mode: opts.mode, items, index: 0, startedAt: Date.now() };
}

export function pick(s: Session, choice: number): Session {
  const item = s.items[s.index];
  if (!item) return s;
  // В тренировке ответ фиксируется с первого раза: после него показывается разбор.
  if (s.mode === 'practice' && item.picked !== null) return s;
  const items = s.items.slice();
  items[s.index] = { ...item, picked: choice };
  return { ...s, items };
}

export function goTo(s: Session, index: number): Session {
  return { ...s, index: Math.max(0, Math.min(s.items.length - 1, index)) };
}

export function grade(item: SessionItem): Graded {
  const q = item.question;
  const original = item.picked === null ? null : item.order[item.picked]!;
  const correct = original !== null && isCorrectOriginal(q, original);
  const right = correctOriginal(q);
  let note: string;
  if (q.kind === 'choice') {
    const optionNote = original !== null && !correct ? q.optionNotes?.[original] : undefined;
    note = optionNote ? `${optionNote}\n\n${q.explanation}` : q.explanation;
  } else {
    note = (original !== null ? q.options[original]?.feedback : undefined) ?? q.options[right]?.feedback ?? '';
  }
  return {
    item,
    correct,
    pickedText: original === null ? null : optionText(q, original),
    correctText: optionText(q, right),
    note,
  };
}

export function summarize(s: Session, now = Date.now()): Summary {
  const graded = s.items.map(grade);
  const correct = graded.filter((g) => g.correct).length;
  const total = s.items.length;
  const percent = total ? Math.round((correct / total) * 100) : 0;
  return { total, correct, percent, passed: percent >= PASS_PERCENT, graded, durationMs: now - s.startedAt };
}

export function answeredCount(s: Session): number {
  return s.items.filter((i) => i.picked !== null).length;
}
