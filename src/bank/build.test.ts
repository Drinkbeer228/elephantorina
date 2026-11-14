import { readdirSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import catalog from './books.json' with { type: 'json' };
import { COURSES_DATA } from './legacy/coursesData';
import { QUIZ_QUESTIONS } from './legacy/quizData';
import { LESSON_LINKS } from './lessonLinks';
import { buildBank, testQuestions, termQuestions, lessonToBook, type Catalog } from './build';
import { coverage } from './coverage';
import type { TopicFile } from './types';

const topicsDir = new URL('./topics/', import.meta.url);
const topicFiles: { path: string; topic: TopicFile }[] = [];
for (const f of readdirSync(topicsDir).filter((f) => f.endsWith('.ts')).sort()) {
  topicFiles.push({ path: `src/bank/topics/${f}`, topic: (await import(new URL(f, topicsDir).href)).default });
}

const bank = buildBank({
  catalog: catalog as Catalog,
  courses: COURSES_DATA,
  links: LESSON_LINKS,
  files: topicFiles,
  extraLoose: QUIZ_QUESTIONS.map((q) => ({
    origin: `общая викторина / ${q.category}`,
    question: { kind: 'choice', id: q.id, prompt: q.question, options: q.options, answer: q.correctIndex, explanation: q.explanation },
  })),
});

test('every lesson link and topic file points to a book in the catalog without problems', () => {
  assert.deepEqual(bank.problems, []);
});

test('all catalog books are covered by tests', () => {
  assert.equal(bank.topics.size, (catalog as Catalog).books.length);
});

test('lesson links are unique per lesson', () => {
  const seen = new Set<string>();
  for (const l of LESSON_LINKS) {
    assert.ok(!seen.has(l.lesson), `duplicate link for ${l.lesson}`);
    seen.add(l.lesson);
  }
});

test('question ids are unique across the bank', () => {
  const ids = [...bank.topics.values()].flatMap((t) => testQuestions(bank, t.book).map((q) => q.id));
  ids.push(...bank.loose.map((l) => l.question.id));
  assert.equal(new Set(ids).size, ids.length);
});

test('duplicated cognition lessons are taken once', () => {
  const t = bank.topics.get('cognition/cognitive-architecture-and-self-awareness')!;
  assert.equal(t.sources.length, 1);
  assert.equal(t.questions.length, 2);
});

test('trunk book collects both lessons, terms become questions', () => {
  const t = bank.topics.get('anatomy/muscular-hydrostat-and-trunk-biomechanics')!;
  assert.equal(t.sources.length, 2);
  const tq = termQuestions(t, []);
  assert.equal(tq.length, t.terms.length);
  for (const q of tq) {
    assert.equal(new Set(q.options).size, q.options.length, 'options are distinct');
    assert.ok(q.options[q.answer]!.length > 0);
  }
});

test('valid answers everywhere', () => {
  for (const t of bank.topics.values()) {
    for (const q of testQuestions(bank, t.book)) {
      if (q.kind === 'choice') assert.ok(q.answer >= 0 && q.answer < q.options.length, q.id);
      else assert.equal(q.options.filter((o) => o.correct).length, 1, q.id);
    }
  }
});

test('legacy lesson ids map to books', () => {
  assert.equal(lessonToBook(LESSON_LINKS, 'lesson-3-18-1'), 'anatomy/muscular-hydrostat-and-trunk-biomechanics');
  assert.equal(lessonToBook(LESSON_LINKS, 'nope'), null);
});

test('coverage counts add up', () => {
  const c = coverage(bank, LESSON_LINKS);
  assert.equal(c.totals.covered, bank.topics.size);
  assert.equal(c.disciplines.reduce((n, d) => n + d.missing.length, 0), c.totals.books - c.totals.covered);
});

test('topic files are merged and unknown books are reported', () => {
  const b = buildBank({
    catalog: catalog as Catalog, courses: [], links: [],
    files: [
      { path: 'a.ts', topic: { book: 'genomics/epigenetic-clocks-dna-methylation-and-aging', questions: [{ kind: 'choice', id: 'g1', prompt: 'p', options: ['x', 'y'], answer: 1, explanation: 'e' }] } },
      { path: 'b.ts', topic: { book: 'genomics/nope', questions: [] } },
    ],
  });
  assert.equal(b.topics.get('genomics/epigenetic-clocks-dna-methylation-and-aging')!.questions.length, 1);
  assert.equal(b.problems.length, 1);
});

test('topic file questions have valid content and supported inline markup', () => {
  for (const { path, topic } of topicFiles) {
    assert.ok((topic.questions?.length ?? 0) > 0, `${path} has no questions`);
    for (const q of topic.questions ?? []) {
      assert.ok(q.prompt.trim().length > 0, `${q.id} empty prompt`);
      assert.ok(q.explanation.trim().length > 0, `${q.id} empty explanation`);
      const optTexts = q.kind === 'choice' ? q.options : q.options.map((o) => o.text);
      assert.equal(new Set(optTexts).size, optTexts.length, `${q.id} duplicate options`);
      for (const txt of [q.prompt, q.explanation, ...optTexts]) {
        const dollars = txt.match(/\$/g) ?? [];
        assert.equal(dollars.length % 2, 0, `${q.id} unbalanced $ in ${txt}`);
        for (const m of txt.matchAll(/\$([^$\n]+)\$/g)) {
          const stripped = m[1]!
            .replace(/\\frac\{[^}]+\}\{[^}]+\}/g, '')
            .replace(/\\(times|pm|approx|delta|ge(q)?|le(q)?|rightarrow|to|%)/g, '')
            .replace(/\\text\{[^}]+\}/g, '')
            .replace(/\\\s+/g, ' ');
          assert.ok(!/\\[a-zA-Z]+/.test(stripped), `${q.id} unsupported TeX in ${m[0]}`);
        }
      }
    }
  }
});
