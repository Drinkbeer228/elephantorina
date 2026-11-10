import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";
import type { QuizQuestion } from "../../../data/quizData";
import { DIFFICULTY_LABEL, pointsFor } from "../../quiz/scoring";

type OptionState = "idle" | "correct" | "wrong" | "reveal" | "dim";

const optionClass: Record<OptionState, string> = {
  idle: "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm hover:-translate-y-0.5 hover:border-emerald-500/60 hover:shadow-md",
  correct: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100 shadow-md shadow-emerald-600/10",
  wrong: "border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100",
  reveal: "border-emerald-500/70 border-dashed bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100",
  dim: "border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500",
};

const badgeClass: Record<OptionState, string> = {
  idle: "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200",
  correct: "border-emerald-600 bg-emerald-600 text-white",
  wrong: "border-rose-500 bg-rose-500 text-white",
  reveal: "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  dim: "border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500",
};

function stateFor(index: number, correctIndex: number, selected: number | null): OptionState {
  if (selected === null) return "idle";
  if (index === correctIndex) return index === selected ? "correct" : "reveal";
  if (index === selected) return "wrong";
  return "dim";
}

interface Props {
  question: QuizQuestion;
  selected: number | null;
  isLast: boolean;
  onChoose: (optionIndex: number) => void;
  onNext: () => void;
}

export default function QuizQuestionCard({ question, selected, isLast, onChoose, onNext }: Props) {
  const answered = selected !== null;
  const isCorrect = selected === question.correctIndex;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && answered) {
        e.preventDefault();
        onNext();
        return;
      }
      if (!answered && /^[1-9]$/.test(e.key)) {
        const i = Number(e.key) - 1;
        if (i < question.options.length) onChoose(i);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [answered, onChoose, onNext, question.options.length]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
          {question.category}
        </span>
        <span className="inline-flex items-center rounded-full border border-slate-200 px-2.5 py-1 font-mono text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {DIFFICULTY_LABEL[question.difficulty]} · {pointsFor(question)} очков
        </span>
      </div>

      <h2 className="text-xl font-bold leading-snug tracking-tight text-slate-900 dark:text-white sm:text-2xl">
        {question.question}
      </h2>

      <div className="space-y-2.5" role="radiogroup" aria-label="Варианты ответа">
        {question.options.map((option, i) => {
          const state = stateFor(i, question.correctIndex, selected);
          return (
            <motion.button
              key={i}
              type="button"
              role="radio"
              aria-checked={selected === i}
              disabled={answered}
              onClick={() => onChoose(i)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              whileTap={answered ? undefined : { scale: 0.98 }}
              className={`group flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-[15px] leading-6 transition-all duration-300 disabled:cursor-default ${optionClass[state]}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-semibold transition-colors duration-300 ${badgeClass[state]}`}
              >
                {state === "correct" || state === "reveal" ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : state === "wrong" ? (
                  <X className="h-4 w-4" strokeWidth={3} />
                ) : (
                  i + 1
                )}
              </span>
              <span className="flex-1">{option}</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div
            key="explanation"
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div
              className={`rounded-2xl border p-4 sm:p-5 ${
                isCorrect
                  ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"
                  : "border-rose-300 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30"
              }`}
            >
              <p
                className={`mb-1.5 text-sm font-bold ${
                  isCorrect ? "text-emerald-800 dark:text-emerald-300" : "text-rose-800 dark:text-rose-300"
                }`}
              >
                {isCorrect ? `Верно, +${pointsFor(question)} очков` : "Не совсем. Правильный ответ подсвечен"}
              </p>
              <p className="text-[15px] leading-7 text-slate-800 dark:text-slate-200">{question.explanation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={onNext}
        disabled={!answered}
        className="press flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-base font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
      >
        {isLast ? "Посмотреть результат" : "Следующий вопрос"}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
