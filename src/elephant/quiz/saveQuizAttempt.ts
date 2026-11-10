import { supabase } from "../../lib/supabase";

export interface QuizAttemptRecord {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  accuracy: number;
  rankCode: string;
  durationMs: number;
}

export async function saveQuizAttempt(record: QuizAttemptRecord): Promise<void> {
  const { error } = await supabase.from("quiz_attempts").insert({
    total_questions: record.totalQuestions,
    correct_answers: record.correctAnswers,
    score: record.score,
    accuracy: record.accuracy,
    rank_code: record.rankCode,
    duration_seconds: Math.round(record.durationMs / 1000),
  });
  if (error) throw error;
}
