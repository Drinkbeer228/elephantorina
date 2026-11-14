/**
 * Сборка банка: каталог книг + уроки старого курса + файлы базы знаний → темы по книгам.
 * Чистые функции без обращения к Vite: их проверяют тесты.
 */
import type { Course, Step } from './legacy/course';
import type { LessonLink } from './lessonLinks';
import type { Book, Discipline, Question, Term, Topic, TopicFile, ChoiceQuestion } from './types';

export interface Catalog {
  disciplines: Discipline[];
  books: Book[];
  generatedAt: string;
}

export interface LooseQuestion {
  question: Question;
  /** Откуда вопрос: урок курса или иной источник. */
  origin: string;
}

export interface Bank {
  catalog: Catalog;
  books: Map<string, Book>;
  topics: Map<string, Topic>;
  /** Вопросы, у которых нет книги: их видно на странице «Список», в тестах по книгам их нет. */
  loose: LooseQuestion[];
  /** Ссылки на книги, которых нет в каталоге: ошибка в данных, показываются на странице «Список». */
  problems: string[];
}

/** Вопросы на термины, собранные из карточек: определение верное, три чужих — отвлекающие. */
export function termQuestions(topic: Topic, pool: Term[]): ChoiceQuestion[] {
  if (topic.terms.length === 0) return [];
  const own = new Set(topic.terms.map((t) => t.definition));
  const out: ChoiceQuestion[] = [];
  for (const t of topic.terms) {
    // Сначала соседние термины этой же темы, затем остальные; порядок стабилен — от хеша id.
    const byHash = (a: string, b: string) => hash(t.id + a) - hash(t.id + b);
    // Определения того же термина (например, из другого урока) в отвлекающие не берём.
    const other = (x: Term) => norm(x.term) !== norm(t.term);
    const sameTopic = topic.terms.filter(other).map((x) => x.definition).sort(byHash);
    const rest = pool.filter((x) => other(x) && !own.has(x.definition)).map((x) => x.definition).sort(byHash);
    const distractors = [...sameTopic, ...rest].filter((d, i, arr) => arr.indexOf(d) === i).slice(0, 3);
    if (distractors.length < 2) continue;
    const at = hash(t.id) % (distractors.length + 1);
    const options = [...distractors];
    options.splice(at, 0, t.definition);
    out.push({
      kind: 'choice',
      id: `term:${t.id}`,
      prompt: `Что означает «${t.term}»?`,
      options,
      answer: at,
      // Правильный вариант и есть определение: отдельное объяснение его бы повторило.
      explanation: '',
    });
  }
  return out;
}

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function fromStep(step: Step): { q?: Question; terms?: Term[] } {
  switch (step.type) {
    case 'QUIZ':
      return {
        q: {
          kind: 'choice',
          id: step.id,
          prompt: step.question,
          options: step.options,
          answer: step.correctAnswer,
          explanation: step.explanation,
          optionNotes: step.wrongExplanation
            ? remapNotes(step.wrongExplanation, step.options.length, step.correctAnswer)
            : undefined,
        },
      };
    case 'SCENARIO':
      return {
        q: {
          kind: 'case',
          id: step.id,
          title: step.title.replace(/^(Клинический|Полевой)?\s*(сценарий|симулятор|кейс)\s*[:.]\s*/i, ''),
          subject: { name: step.patientInfo.name, age: step.patientInfo.age, role: step.patientInfo.role },
          situation: step.situation,
          options: step.options.map((o) => ({ text: o.text, correct: o.isCorrect, feedback: o.feedback })),
        },
      };
    case 'FLASHCARD':
      return { terms: step.cards.map((c, i) => ({ id: `${step.id}#${i}`, term: c.term, definition: c.definition })) };
    default:
      return {};
  }
}

/** В старых данных `wrongExplanation` перечисляет разборы только неверных вариантов, по порядку. */
function remapNotes(notes: string[], n: number, correct: number): (string | undefined)[] {
  if (notes.length === n) return notes;
  const out: (string | undefined)[] = [];
  let j = 0;
  for (let i = 0; i < n; i++) out.push(i === correct ? undefined : notes[j++]);
  return out;
}

export function buildBank(input: {
  catalog: Catalog;
  courses: Course[];
  links: LessonLink[];
  files: { path: string; topic: TopicFile }[];
  extraLoose?: LooseQuestion[];
}): Bank {
  const books = new Map(input.catalog.books.map((b) => [b.id, b]));
  const topics = new Map<string, Topic>();
  const loose: LooseQuestion[] = [...(input.extraLoose ?? [])];
  const problems: string[] = [];
  const linkOf = new Map(input.links.map((l) => [l.lesson, l]));
  const seenLessons = new Set<string>();
  const seenQuestions = new Set<string>();

  const topicFor = (book: string): Topic => {
    let t = topics.get(book);
    if (!t) {
      t = { book, questions: [], terms: [], sources: [] };
      topics.set(book, t);
    }
    return t;
  };

  for (const l of input.links) {
    if (!books.has(l.book)) problems.push(`lessonLinks: ${l.lesson} → книги «${l.book}» нет в каталоге`);
  }

  for (const course of input.courses) {
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        // Уроки 25–28 повторяются в двух треках с одинаковыми id — берём один раз.
        if (seenLessons.has(lesson.id)) continue;
        seenLessons.add(lesson.id);
        const link = linkOf.get(lesson.id);
        const target = link && books.has(link.book) ? topicFor(link.book) : null;
        if (target) target.sources.push({ kind: 'course', course: course.id, lesson: lesson.id, lessonTitle: lesson.title });
        for (const step of lesson.steps) {
          const { q, terms } = fromStep(step);
          if (q && !seenQuestions.has(q.id)) {
            seenQuestions.add(q.id);
            if (target) target.questions.push(q);
            else loose.push({ question: q, origin: `${course.id} / ${lesson.title}` });
          }
          if (terms && target) {
            // Один термин в теме — одна карточка: повтор из второго урока не добавляем.
            const have = new Set(target.terms.map((x) => norm(x.term)));
            target.terms.push(...terms.filter((x) => !have.has(norm(x.term)) && have.add(norm(x.term))));
          }
        }
      }
    }
  }

  for (const { path, topic } of input.files) {
    if (!books.has(topic.book)) {
      problems.push(`${path}: книги «${topic.book}» нет в каталоге`);
      continue;
    }
    const t = topicFor(topic.book);
    t.sources.push({ kind: 'bank', file: path });
    for (const q of topic.questions ?? []) {
      if (seenQuestions.has(q.id)) {
        problems.push(`${path}: повтор id вопроса «${q.id}»`);
        continue;
      }
      seenQuestions.add(q.id);
      t.questions.push(q);
    }
    t.terms.push(...(topic.terms ?? []));
  }

  // Тема без вопросов и терминов не считается темой.
  for (const [id, t] of topics) if (t.questions.length === 0 && t.terms.length === 0) topics.delete(id);

  return { catalog: input.catalog, books, topics, loose, problems };
}

/** Все вопросы темы для теста: свои плюс вопросы на термины. */
export function testQuestions(bank: Bank, book: string): Question[] {
  const t = bank.topics.get(book);
  if (!t) return [];
  const pool = [...bank.topics.values()]
    .filter((x) => x.book !== book && bank.books.get(x.book)?.discipline === bank.books.get(book)?.discipline)
    .flatMap((x) => x.terms);
  return [...t.questions, ...termQuestions(t, pool)];
}

export function lessonToBook(links: LessonLink[], lesson: string | null): string | null {
  if (!lesson) return null;
  return links.find((l) => l.lesson === lesson)?.book ?? null;
}
