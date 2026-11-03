// Типы степов
export type StepType = 'THEORY' | 'QUIZ' | 'FLASHCARD' | 'SCENARIO';

// Базовый степ
export interface Step {
  id: string;
  title: string;
  type: StepType;
  content: string;
  order: number;
}

// Теоретический степ
export interface TheoryStep extends Step {
  type: 'THEORY';
  sections: {
    heading: string;
    text: string;
    highlights?: string[];
    clinicalGuidance?: string;
    facts?: string[];
  }[];
}

// Тестовый степ
export interface QuizStep extends Step {
  type: 'QUIZ';
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

// Степ с карточками
export interface FlashcardStep extends Step {
  type: 'FLASHCARD';
  cards: {
    id: string;
    front: string;
    back: string;
    emoji?: string;
  }[];
}

// Сценарный степ
export interface ScenarioStep extends Step {
  type: 'SCENARIO';
  scenario: string;
  choices: {
    id: string;
    text: string;
    consequence: string;
    isOptimal: boolean;
  }[];
}

// Модуль курса
export interface Module {
  id: string;
  title: string;
  description: string;
  emoji: string;
  steps: Step[];
}

// Курс
export interface Course {
  id: string;
  title: string;
  description: string;
  emoji: string;
  modules: Module[];
}

// Прогресс пользователя
export interface UserProgress {
  courseId: string;
  completedSteps: string[];
  currentStepId: string;
  score: number;
  bookmarks: string[];
  quizAnswers: Record<string, string>;
  startedAt: string;
  lastActivity: string;
}
