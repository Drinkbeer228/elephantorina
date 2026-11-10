import type { QuizDifficulty, QuizQuestion } from "../../data/quizData";

export const POINTS_BY_DIFFICULTY: Record<QuizDifficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
};

export const DIFFICULTY_LABEL: Record<QuizDifficulty, string> = {
  easy: "Базовый",
  medium: "Средний",
  hard: "Экспертный",
};

export function pointsFor(question: QuizQuestion): number {
  return POINTS_BY_DIFFICULTY[question.difficulty];
}

export function accuracyPercent(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

export interface QuizRank {
  code: "master" | "specialist" | "novice";
  title: string;
  motto: string;
}

export function getQuizRank(accuracy: number): QuizRank {
  if (accuracy >= 80) {
    return {
      code: "master",
      title: "Мастер-эксперт",
      motto: "Уверенно разбирается в биологии, поведении и охране слонов.",
    };
  }
  if (accuracy >= 50) {
    return {
      code: "specialist",
      title: "Специалист",
      motto: "Хорошая база знаний. Перечитайте разборы ошибок, чтобы закрыть пробелы.",
    };
  }
  return {
    code: "novice",
    title: "Новичок",
    motto: "Отличное начало. Пройдите викторину еще раз и сравните результат.",
  };
}
