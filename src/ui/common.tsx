import { useMemo, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { BANK } from '../bank';
import { testQuestions } from '../bank/build';
import type { Book, Question } from '../bank/types';
import { href, type Route } from '../app/router';

/** Цвета дисциплин — те же, что у обложек книг в библиотеке станции. */
export const DISC_COLORS: Record<string, string> = {
  taxonomy: '#6B7D57',
  anatomy: '#C86D51',
  ethogram: '#A96B3B',
  cognition: '#4F7F78',
  veterinary: '#2E5A44',
  ecology: '#7E9A5E',
  conservation: '#7A5C3E',
  culture: '#B8893B',
  paleontology: '#BFA468',
  genomics: '#8C5A6E',
};

export const discColor = (id: string | undefined) => (id && DISC_COLORS[id]) || '#5A605D';

export function disciplineName(id: string | undefined): string {
  return BANK.catalog.disciplines.find((d) => d.id === id)?.name ?? '';
}

/** Короткое имя дисциплины для меток: «Анатомия и Физиология» → «Анатомия». */
export function disciplineShort(id: string | undefined): string {
  return disciplineName(id).split(/\s+и\s+/)[0] ?? '';
}

export function bookOf(id: string): Book | undefined {
  return BANK.books.get(id);
}

/** Название для списков: полное название книги до подзаголовка. */
export function bookLabel(b: Book): string {
  // shortTitle в каталоге — обрезка по словам, часто обрывается на середине; берём полное до двоеточия.
  return b.title.split(/:\s/)[0]!.replace(/\s+(у|рода|семейства)?\s*Elephantidae$/, '').trim();
}

export interface Located {
  question: Question;
  book: string | null;
  origin?: string;
}

/** Все вопросы банка по id: свои, на термины и без книги. */
export const ALL_QUESTIONS: Map<string, Located> = (() => {
  const m = new Map<string, Located>();
  for (const t of BANK.topics.values()) {
    for (const q of testQuestions(BANK, t.book)) m.set(q.id, { question: q, book: t.book });
  }
  for (const l of BANK.loose) m.set(l.question.id, { question: l.question, book: null, origin: l.origin });
  return m;
})();

export function topicCounts(book: string): { own: number; terms: number; cases: number; total: number } {
  const t = BANK.topics.get(book);
  if (!t) return { own: 0, terms: 0, cases: 0, total: 0 };
  const termQ = testQuestions(BANK, book).length - t.questions.length;
  return {
    own: t.questions.length,
    terms: termQ,
    cases: t.questions.filter((q) => q.kind === 'case').length,
    total: t.questions.length + termQ,
  };
}

/** Безопасная строчная разметка: **жирный**, *курсив*, $формулы$ и латинские названия. */
export function Rich({ text, className, as: Tag = 'span' }: { text: string; className?: string; as?: 'span' | 'p' | 'div' }) {
  const html = useMemo(() => inlineHtml(text), [text]);
  return <Tag className={`rich ${className ?? ''}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Абзацы через пустую строку. */
export function RichBlock({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  return (
    <div className={className}>
      {parts.map((p, i) => (
        <Rich key={i} as="p" text={p} />
      ))}
    </div>
  );
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function inlineHtml(input: string): string {
  if (!input) return '';
  const math: string[] = [];
  // Формулы вынимаем до экранирования, чтобы \frac и ^ не превратились в текст.
  let s = input.replace(/\$([^$\n]+)\$/g, (_, raw: string) => {
    const t = raw.trim();
    if (/^[A-Z][a-z]+(\\\s+|\s+)[a-z.]+$/.test(t)) {
      math.push(`<em class="taxon">${esc(t.replace(/\\\s+/g, ' '))}</em>`);
    } else {
      const body = esc(t)
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
        .replace(/\\times/g, '×')
        .replace(/\\pm/g, '±')
        .replace(/\\approx/g, '≈')
        .replace(/\\delta/g, 'δ')
        .replace(/\\ge(q)?/g, '≥')
        .replace(/\\le(q)?/g, '≤')
        .replace(/\\rightarrow|\\to/g, '→')
        .replace(/\\%/g, '%')
        .replace(/\\\s+/g, ' ')
        .replace(/\\text\{([^}]+)\}/g, '$1')
        .replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>')
        .replace(/\^([0-9+\-]+)/g, '<sup>$1</sup>')
        .replace(/_\{([^}]+)\}/g, '<sub>$1</sub>')
        .replace(/_([0-9a-zA-Z]+)/g, '<sub>$1</sub>');
      math.push(`<code class="math">${body}</code>`);
    }
    return `\u0000${math.length - 1}\u0000`;
  });
  s = esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/\n/g, '<br>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i: string) => math[Number(i)] ?? '');
}

export function Link({ to, children, ...rest }: { to: Route; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return (
    <a href={href(to)} {...rest}>
      {children}
    </a>
  );
}

export function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  const w = m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many;
  return `${n} ${w}`;
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  } catch {
    return '';
  }
}

export function Icon({ name, size = 18 }: { name: 'arrow-left' | 'arrow-right' | 'book' | 'external' | 'check' | 'x' | 'list' | 'cards' | 'repeat' | 'search' | 'shuffle'; size?: number }) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (name) {
    case 'arrow-left':
      return <svg {...p}><path d="M15 18l-6-6 6-6" /></svg>;
    case 'arrow-right':
      return <svg {...p}><path d="M9 18l6-6-6-6" /></svg>;
    case 'book':
      return <svg {...p}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /></svg>;
    case 'external':
      return <svg {...p}><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>;
    case 'check':
      return <svg {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
    case 'x':
      return <svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case 'list':
      return <svg {...p}><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></svg>;
    case 'cards':
      return <svg {...p}><rect x="3" y="6" width="14" height="14" rx="2.5" /><path d="M7 3h11.5A2.5 2.5 0 0 1 21 5.5V17" /></svg>;
    case 'repeat':
      return <svg {...p}><path d="M17 2l4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3" /></svg>;
    case 'search':
      return <svg {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>;
    case 'shuffle':
      return <svg {...p}><path d="M16 3h5v5" /><path d="M4 20L21 3" /><path d="M21 16v5h-5" /><path d="M15 15l6 6" /><path d="M4 4l5 5" /></svg>;
  }
}
