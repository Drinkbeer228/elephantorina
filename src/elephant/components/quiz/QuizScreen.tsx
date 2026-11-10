import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Clock, ListChecks, Sparkles } from "lucide-react";
import { QUIZ_QUESTIONS } from "../../../data/quizData";
import { playClick, playCorrect, playWrong } from "../../sound";
import { getQuizRank, pointsFor } from "../../quiz/scoring";
import { useQuizSession } from "../../quiz/useQuizSession";
import { saveQuizAttempt } from "../../quiz/saveQuizAttempt";
import QuizProgressBar from "./QuizProgressBar";
import QuizQuestionCard from "./QuizQuestionCard";
import QuizResults, { type SaveStatus } from "./QuizResults";

interface Props {
  onExit: () => void;
}

const MAX_SCORE = QUIZ_QUESTIONS.reduce((sum, q) => sum + pointsFor(q), 0);

export default function QuizScreen({ onExit }: Props) {
  const session = useQuizSession(QUIZ_QUESTIONS);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saving");

  const { status, current, index, total, selected, score, correctCount, accuracy, elapsedMs, mistakes, start, choose, advance } = session;

  const handleChoose = useCallback(
    (optionIndex: number) => {
      if (!current || selected !== null) return;
      if (optionIndex === current.correctIndex) playCorrect();
      else playWrong();
      choose(optionIndex);
    },
    [current, selected, choose]
  );

  const handleNext = useCallback(() => {
    if (selected === null) return;
    playClick();
    advance();
  }, [selected, advance]);

  useEffect(() => {
    if (status !== "finished") return;
    setSaveStatus("saving");
    saveQuizAttempt({
      totalQuestions: total,
      correctAnswers: correctCount,
      score,
      accuracy,
      rankCode: getQuizRank(accuracy).code,
      durationMs: elapsedMs,
    })
      .then(() => setSaveStatus("saved"))
      .catch(() => setSaveStatus("error"));
  }, [status]);

  const handleRestart = () => {
    playClick();
    start();
    window.scrollTo({ top: 0 });
  };

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-4 sm:pt-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          className="h-9 rounded-lg px-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          ← В меню
        </button>
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Викторина</span>
      </div>

      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.section
            key="intro"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Проверка знаний
              </span>
              <h1 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Викторина о слонах
              </h1>
              <p className="mt-3 text-[15px] leading-7 text-slate-600 dark:text-slate-300">
                Ответьте на вопросы по анатомии, поведению и охране слонов. После каждого ответа появится объяснение.
                Баллы зависят от сложности вопроса.
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                  <dt className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <ListChecks className="h-3.5 w-3.5" aria-hidden="true" /> Вопросов
                  </dt>
                  <dd className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white">{total}</dd>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                  <dt className="text-xs text-slate-500 dark:text-slate-400">Максимум очков</dt>
                  <dd className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white">{MAX_SCORE}</dd>
                </div>
              </dl>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Таймер покажет время прохождения
              </p>
            </div>

            <button
              type="button"
              onClick={handleRestart}
              className="press flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-base font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"
            >
              Начать викторину <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </motion.section>
        )}

        {status === "playing" && current && (
          <motion.section
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <QuizProgressBar index={index} total={total} score={score} elapsedMs={elapsedMs} />
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-7">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -28 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <QuizQuestionCard
                    question={current}
                    selected={selected}
                    isLast={index === total - 1}
                    onChoose={handleChoose}
                    onNext={handleNext}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.section>
        )}

        {status === "finished" && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <QuizResults
              score={score}
              maxScore={MAX_SCORE}
              correctCount={correctCount}
              total={total}
              accuracy={accuracy}
              rank={getQuizRank(accuracy)}
              mistakes={mistakes}
              saveStatus={saveStatus}
              onRestart={handleRestart}
              onExit={onExit}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
