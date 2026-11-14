/** Банк приложения: собирается один раз при загрузке. */
import catalogJson from './books.json';
import { COURSES_DATA } from './legacy/coursesData';
import { QUIZ_QUESTIONS } from './legacy/quizData';
import { LESSON_LINKS } from './lessonLinks';
import { buildBank, type Catalog, type LooseQuestion } from './build';
import type { TopicFile } from './types';

// База знаний: каждый файл в ./topics — одна книга. Формат — в ./topics/README.md.
const modules = import.meta.glob<{ default: TopicFile }>('./topics/*.ts', { eager: true });
const files = Object.entries(modules).map(([path, m]) => ({ path: path.replace('./', 'src/bank/'), topic: m.default }));

// Общая викторина без привязки к книгам: вопросы не потеряны, ждут своей книги на странице «Список».
const quizLoose: LooseQuestion[] = QUIZ_QUESTIONS.map((q) => ({
  origin: `общая викторина / ${q.category}`,
  question: { kind: 'choice', id: q.id, prompt: q.question, options: q.options, answer: q.correctIndex, explanation: q.explanation },
}));

export const BANK = buildBank({
  catalog: catalogJson as Catalog,
  courses: COURSES_DATA,
  links: LESSON_LINKS,
  files,
  extraLoose: quizLoose,
});
