/**
 * Банк вопросов Elephantorina.
 *
 * Единица — тема, привязанная к книге библиотеки Research Station (id книги из каталога Elephantology,
 * например `anatomy/muscular-hydrostat-and-trunk-biomechanics`). Теория живёт в книгах; здесь только проверка.
 */

/** Вопрос с одним правильным вариантом. */
export interface ChoiceQuestion {
  kind: 'choice';
  /** Стабильный id: по нему хранится прогресс. Не менять после публикации. */
  id: string;
  prompt: string;
  options: string[];
  /** Индекс правильного варианта в `options`. */
  answer: number;
  /** Объяснение правильного ответа. */
  explanation: string;
  /** Необязательный разбор каждого варианта (той же длины, что `options`). */
  optionNotes?: (string | undefined)[];
  /** Глава или раздел книги, где искать ответ (заголовок h2/h3 книги). */
  section?: string;
}

/** Клинический или полевой случай: ситуация и варианты действий с обратной связью к каждому. */
export interface CaseQuestion {
  kind: 'case';
  id: string;
  /** Короткое название случая. */
  title: string;
  subject?: { name: string; age?: number; role?: string };
  situation: string;
  options: { text: string; correct: boolean; feedback: string }[];
  section?: string;
}

export type Question = ChoiceQuestion | CaseQuestion;

/** Термин и определение: идут в режим «Термины» и в автоматические вопросы на термины. */
export interface Term {
  id: string;
  term: string;
  definition: string;
}

/** Откуда пришёл материал темы. */
export type TopicSource =
  | { kind: 'course'; course: string; lesson: string; lessonTitle: string }
  | { kind: 'bank'; file: string };

export interface Topic {
  /** id книги в каталоге библиотеки. */
  book: string;
  questions: Question[];
  terms: Term[];
  sources: TopicSource[];
}

/** Запись каталога библиотеки (снимок `books.json`). */
export interface Book {
  id: string;
  discipline: string;
  title: string;
  shortTitle: string;
  readingMinutes: number;
}

export interface Discipline {
  id: string;
  name: string;
  order: number;
  description: string;
}

/** Файл темы из базы знаний (`src/bank/topics/*.ts`). */
export interface TopicFile {
  book: string;
  questions?: Question[];
  terms?: Term[];
}
