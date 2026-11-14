// Пишет docs/knowledge-base.md — список на наполнение базы знаний.  npm run coverage
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import catalog from '../src/bank/books.json' with { type: 'json' };
import { COURSES_DATA } from '../src/bank/legacy/coursesData';
import { QUIZ_QUESTIONS } from '../src/bank/legacy/quizData';
import { LESSON_LINKS } from '../src/bank/lessonLinks';
import { buildBank, type Catalog } from '../src/bank/build';
import { coverage, coverageMarkdown } from '../src/bank/coverage';
import type { TopicFile } from '../src/bank/types';

const dir = new URL('../src/bank/topics/', import.meta.url);
const files: { path: string; topic: TopicFile }[] = [];
for (const f of readdirSync(dir).filter((f) => f.endsWith('.ts')).sort()) {
  files.push({ path: `src/bank/topics/${f}`, topic: (await import(new URL(f, dir).href)).default });
}
const bank = buildBank({
  catalog: catalog as Catalog,
  courses: COURSES_DATA,
  links: LESSON_LINKS,
  files,
  extraLoose: QUIZ_QUESTIONS.map((q) => ({
    origin: `общая викторина / ${q.category}`,
    question: { kind: 'choice', id: q.id, prompt: q.question, options: q.options, answer: q.correctIndex, explanation: q.explanation },
  })),
});
mkdirSync(new URL('../docs/', import.meta.url), { recursive: true });
const md = coverageMarkdown(coverage(bank, LESSON_LINKS), (catalog as Catalog).generatedAt);
writeFileSync(new URL('../docs/knowledge-base.md', import.meta.url), md);
console.log(`docs/knowledge-base.md: ${bank.topics.size} книг с тестами из ${bank.catalog.books.length}`);
