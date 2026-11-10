import { useEffect, useState } from "react";
import { animate, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Check, Copy, RotateCcw, ChevronDown, Home } from "lucide-react";
import type { QuizQuestion } from "../../../data/quizData";
import type { QuizRank } from "../../quiz/scoring";
import type { QuizMistake } from "../../quiz/useQuizSession";

export type SaveStatus = "saving" | "saved" | "error";

interface Props {
  score: number;
  maxScore: number;
  correctCount: number;
  total: number;
  accuracy: number;
  rank: QuizRank;
  mistakes: QuizMistake[];
  saveStatus: SaveStatus;
  onRestart: () => void;
  onExit: () => void;
}

function useAnimatedNumber(target: number, duration = 1.2) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const controls = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [target, duration]);
  return value;
}

const SAVE_LABEL: Record<SaveStatus, string> = {
  saving: "Сохраняем результат...",
  saved: "Результат сохранен",
  error: "Не удалось сохранить результат. Он доступен только на этом экране.",
};

export default function QuizResults({
  score,
  maxScore,
  correctCount,
  total,
  accuracy,
  rank,
  mistakes,
  saveStatus,
  onRestart,
  onExit,
}: Props) {
  const shownScore = useAnimatedNumber(score);
  const shownAccuracy = useAnimatedNumber(accuracy);
  const [copied, setCopied] = useState<"idle" | "ok" | "error">("idle");
  const [openMistake, setOpenMistake] = useState<string | null>(null);

  useEffect(() => {
    if (accuracy >= 80) {
      confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 } });
    }
  }, [accuracy]);

  const handleCopy = async () => {
    const text = `Викторина «Слонология.EDU»\nРезультат: ${score} из ${maxScore} очков\nПравильных ответов: ${correctCount} из ${total} (${accuracy}%)\nЗвание: ${rank.title}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied("ok");
    } catch {
      setCopied("error");
    }
    window.setTimeout(() => setCopied("idle"), 2200);
  };

  const isPassed = accuracy >= 50;

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 p-6 text-white sm:p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-emerald-200">Итоги викторины</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{rank.title}</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-100/90">{rank.motto}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5 sm:p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-800/60">
            <span className="text-xs text-slate-500 dark:text-slate-400">Очки</span>
            <div className="mt-1 font-mono text-3xl font-extrabold tabular-nums text-slate-900 dark:text-white">
              {shownScore}
              <span className="text-base font-semibold text-slate-400"> / {maxScore}</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-800/60">
            <span className="text-xs text-slate-500 dark:text-slate-400">Точность</span>
            <div
              className={`mt-1 font-mono text-3xl font-extrabold tabular-nums ${
                isPassed ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {shownAccuracy}%
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              верно {correctCount} из {total}
            </span>
          </div>
        </div>

        <p
          className={`px-5 pb-5 font-mono text-[11px] sm:px-6 ${
            saveStatus === "error" ? "text-rose-600 dark:text-rose-400" : "text-slate-400 dark:text-slate-500"
          }`}
          role="status"
        >
          {SAVE_LABEL[saveStatus]}
        </p>
      </motion.section>

      {mistakes.length > 0 ? (
        <section className="space-y-3">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Разбор ошибок ({mistakes.length})
          </h3>
          <div className="space-y-2.5">
            {mistakes.map((m) => {
              const open = openMistake === m.question.id;
              return (
                <div
                  key={m.question.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                >
                  <button
                    type="button"
                    onClick={() => setOpenMistake(open ? null : m.question.id)}
                    aria-expanded={open}
                    className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <span className="text-sm font-medium leading-6 text-slate-900 dark:text-slate-100">
                      {m.question.question}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  {open && <MistakeDetail question={m.question} selectedIndex={m.selectedIndex} />}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          Ошибок не допущено. Отличный результат!
        </p>
      )}

      <div className="grid gap-2.5 sm:grid-cols-3">
        <button
          type="button"
          onClick={onRestart}
          className="press flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Пройти заново
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="press flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-800 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        >
          {copied === "ok" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied === "ok" ? "Скопировано" : copied === "error" ? "Не удалось" : "Поделиться результатом"}
        </button>
        <button
          type="button"
          onClick={onExit}
          className="press flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-800 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        >
          <Home className="h-4 w-4" aria-hidden="true" /> В меню
        </button>
      </div>
    </div>
  );
}

function MistakeDetail({ question, selectedIndex }: { question: QuizQuestion; selectedIndex: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.25 }}
      className="space-y-2 border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-800"
    >
      <p className="text-rose-700 dark:text-rose-400">
        Ваш ответ: <span className="font-medium">{question.options[selectedIndex]}</span>
      </p>
      <p className="text-emerald-700 dark:text-emerald-400">
        Правильно: <span className="font-medium">{question.options[question.correctIndex]}</span>
      </p>
      <p className="pt-1 leading-6 text-slate-700 dark:text-slate-300">{question.explanation}</p>
    </motion.div>
  );
}
