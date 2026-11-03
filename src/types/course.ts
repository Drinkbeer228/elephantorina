// Типы степов
export type StepType = 'THEORY' | 'QUIZ' | 'FLASHCARD' | 'SCENARIO';

// Базовый степ
export interface BaseStep {
  id: string;
  type: StepType;
  title: string;
}

// Теоретический степ
export interface TheoryStep extends BaseStep {
  type: 'THEORY';
  content: string;
}

// Карточка для флешкарт
export interface Flashcard {
  term: string;
  definition: string;
}

// Тестовый степ
export interface QuizStep extends BaseStep {
  type: 'QUIZ';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// Степ с карточками
export interface FlashcardStep extends BaseStep {
  type: 'FLASHCARD';
  cards: Flashcard[];
}

// Опция клинического сценария
export interface ScenarioOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string; // Ветеринарное объяснение результатов выбора
}

// Клинический симулятор
export interface ScenarioStep extends BaseStep {
  type: 'SCENARIO';
  patientInfo: {
    name: string;
    age: number;
    role: string;
    avatarEmoji?: string;
  };
  situation: string; // Описание симптомов / обстановки
  options: ScenarioOption[];
}

// Объединённый тип степа
export type Step = TheoryStep | QuizStep | FlashcardStep | ScenarioStep;

// Урок
export interface Lesson {
  id: string;
  title: string;
  steps: Step[];
}

// Модуль курса
export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

// Курс
export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  modules: Module[];
}

// Прогресс пользователя
export interface UserProgress {
  courseId: string;
  completedSteps: string[];
  currentStepId: string;
  score: number;
  bookmarks: string[];
  quizAnswers: Record<string, number>;
  scenarioAnswers: Record<string, string>; // stepId -> optionId
  startedAt: string;
  lastActivity: string;
}
