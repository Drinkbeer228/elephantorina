import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import type { QuizQuestion } from "../../data/quizData";
import { accuracyPercent, pointsFor } from "./scoring";
import { quizReducer, initialQuizState, type QuizAnswer } from "./quizState";

export interface QuizMistake {
  question: QuizQuestion;
  selectedIndex: number;
}

export function useQuizSession(questions: QuizQuestion[]) {
  const [state, dispatch] = useReducer(quizReducer, initialQuizState);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (state.status !== "playing") return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [state.status]);

  const current = questions[state.index];
  const total = questions.length;

  const start = useCallback(() => dispatch({ type: "start", now: Date.now() }), []);

  const choose = useCallback(
    (optionIndex: number) => {
      if (!current) return;
      const correct = optionIndex === current.correctIndex;
      dispatch({
        type: "answer",
        questionId: current.id,
        optionIndex,
        correct,
        points: correct ? pointsFor(current) : 0,
      });
    },
    [current]
  );

  const advance = useCallback(
    () => dispatch({ type: "next", now: Date.now(), total }),
    [total]
  );

  const score = useMemo(
    () => state.answers.reduce((sum, a) => sum + a.points, 0),
    [state.answers]
  );
  const correctCount = useMemo(
    () => state.answers.filter((a) => a.correct).length,
    [state.answers]
  );
  const accuracy = accuracyPercent(correctCount, total);
  const elapsedMs = (state.finishedAt ?? now) - (state.startedAt ?? now);

  const mistakes = useMemo<QuizMistake[]>(() => {
    return state.answers
      .filter((a: QuizAnswer) => !a.correct)
      .map((a) => {
        const question = questions.find((q) => q.id === a.questionId);
        return question ? { question, selectedIndex: a.selectedIndex } : null;
      })
      .filter((m): m is QuizMistake => m !== null);
  }, [state.answers, questions]);

  return {
    status: state.status,
    index: state.index,
    total,
    current,
    selected: state.selected,
    answers: state.answers,
    score,
    correctCount,
    accuracy,
    elapsedMs,
    mistakes,
    start,
    choose,
    advance,
  };
}
