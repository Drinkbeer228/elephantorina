/**
 * Список на наполнение: какие книги без тестов, где тест слишком короткий, что ждёт привязки.
 * Используется страницей «Список» и скриптом `npm run coverage` (пишет docs/knowledge-base.md).
 */
import { testQuestions, type Bank } from './build';
import type { LessonLink } from './lessonLinks';

/** Ниже этого числа вопросов (без вопросов на термины) тест считается коротким. */
export const THIN_TOPIC = 8;

export interface Coverage {
  disciplines: {
    id: string;
    name: string;
    total: number;
    covered: number;
    missing: { id: string; title: string }[];
    thin: { id: string; title: string; own: number; withTerms: number }[];
  }[];
  loose: Bank['loose'];
  unchecked: { lesson: string; book: string; title: string }[];
  problems: string[];
  totals: { books: number; covered: number; questions: number; loose: number };
}

export function coverage(bank: Bank, links: LessonLink[]): Coverage {
  let questions = 0;
  const disciplines = bank.catalog.disciplines.map((d) => {
    const books = bank.catalog.books.filter((b) => b.discipline === d.id);
    const missing: Coverage['disciplines'][number]['missing'] = [];
    const thin: Coverage['disciplines'][number]['thin'] = [];
    for (const b of books) {
      const t = bank.topics.get(b.id);
      if (!t) {
        missing.push({ id: b.id, title: b.title });
        continue;
      }
      const withTerms = testQuestions(bank, b.id).length;
      questions += withTerms;
      if (t.questions.length < THIN_TOPIC) thin.push({ id: b.id, title: b.title, own: t.questions.length, withTerms });
    }
    return { id: d.id, name: d.name, total: books.length, covered: books.length - missing.length, missing, thin };
  });
  const unchecked = links
    .filter((l) => !l.checked)
    .map((l) => ({ ...l, title: bank.books.get(l.book)?.title ?? l.book }));
  return {
    disciplines,
    loose: bank.loose,
    unchecked,
    problems: bank.problems,
    totals: {
      books: bank.catalog.books.length,
      covered: bank.topics.size,
      questions,
      loose: bank.loose.length,
    },
  };
}

export function coverageMarkdown(c: Coverage, generatedAt: string): string {
  const L: string[] = [];
  L.push('# База знаний Elephantorina: что наполнить');
  L.push('');
  L.push(`_Сгенерировано \`npm run coverage\`; каталог библиотеки от ${generatedAt.slice(0, 10)}._`);
  L.push('');
  L.push(
    `Книг в библиотеке: **${c.totals.books}**, с тестом: **${c.totals.covered}**, вопросов в тестах: **${c.totals.questions}**, вопросов без книги: **${c.totals.loose}**.`,
  );
  L.push('');
  L.push('Как добавить вопросы — в `src/bank/topics/README.md`. Одна книга — один файл.');
  L.push('');
  L.push('## Книги без теста');
  for (const d of c.disciplines) {
    if (!d.missing.length) continue;
    L.push('');
    L.push(`### ${d.name} — ${d.covered} из ${d.total}`);
    L.push('');
    for (const m of d.missing) L.push(`- [ ] \`${m.id}\` — ${m.title}`);
  }
  L.push('');
  L.push(`## Короткие тесты (меньше ${THIN_TOPIC} своих вопросов)`);
  L.push('');
  for (const d of c.disciplines) for (const t of d.thin) L.push(`- [ ] \`${t.id}\` — ${t.own} своих, ${t.withTerms} с терминами — ${t.title}`);
  if (c.unchecked.length) {
    L.push('');
    L.push('## Привязки уроков по названию — сверить с книгой');
    L.push('');
    L.push('Правка — `src/bank/lessonLinks.ts`: поставить `checked: true` или перенести урок на другую книгу.');
    L.push('');
    for (const u of c.unchecked) L.push(`- [ ] \`${u.lesson}\` → \`${u.book}\``);
  }
  if (c.loose.length) {
    L.push('');
    L.push('## Вопросы без книги');
    L.push('');
    for (const l of c.loose) {
      const text = l.question.kind === 'choice' ? l.question.prompt : l.question.title;
      L.push(`- \`${l.question.id}\` (${l.origin}) — ${text.replace(/\s+/g, ' ').slice(0, 140)}`);
    }
  }
  if (c.problems.length) {
    L.push('');
    L.push('## Ошибки в данных');
    L.push('');
    for (const p of c.problems) L.push(`- ${p}`);
  }
  L.push('');
  return L.join('\n');
}
