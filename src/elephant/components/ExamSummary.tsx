import React, { useRef } from "react";
import { Check, X, Trophy, Share2, ArrowRight, RotateCcw } from "lucide-react";
import type { Step } from "../../types/course";
import { ACADEMIC_RANKS, ACHIEVEMENTS, getAcademicRank, type AcademicRank } from "../progress";
import Reader from "./Reader";

export interface ExamResult {
  title: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  dateStr: string;
  mistakes: {
    step: Step;
    userAnswer: string | number;
    correctAnswerText: string;
    explanation?: string;
  }[];
}

interface Props {
  result: ExamResult;
  allUnlockedAchievementIds: string[];
  totalGlobalProgressPct: number;
  onReviewMistakes: () => void;
  onHome: () => void;
  onRetake: () => void;
}

export default function ExamSummary({
  result,
  allUnlockedAchievementIds,
  totalGlobalProgressPct,
  onReviewMistakes,
  onHome,
  onRetake,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const currentRank: AcademicRank = getAcademicRank(totalGlobalProgressPct);
  const [copied, setCopied] = React.useState(false);
  const [showMistakesDetail, setShowMistakesDetail] = React.useState(false);

  const handleShare = async () => {
    const text = `🎓 Аттестация «Слонология.EDU»\nРезультат: ${result.accuracy}%\nЗвание: ${currentRank.title}\nДевиз: «${currentRank.motto}»`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isPassed = result.accuracy >= 70;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 pb-32">
      {/* Header action buttons */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onHome}
          className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          ← На главную
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <Share2 className="h-3.5 w-3.5" />
          {copied ? "Скопировано в буфер!" : "Поделиться карточкой"}
        </button>
      </div>

      {/* Screen-ready Certification Card */}
      <div
        ref={cardRef}
        className="overflow-hidden rounded-3xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl transition-colors"
      >
        {/* Certificate Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 p-6 text-white sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-inner backdrop-blur-md">
                🐘
              </span>
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-200">
                  Свидетельство об аттестации
                </span>
                <h1 className="text-lg font-bold sm:text-xl">Слонология.EDU</h1>
              </div>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs text-emerald-100 backdrop-blur-md">
              {result.dateStr}
            </span>
          </div>

          {/* Academic Rank & Motto */}
          <div className="mt-6 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10">
            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-semibold">
              Присвоенный академический ранг
            </div>
            <div className="mt-1 text-base sm:text-lg font-bold leading-snug">
              {currentRank.title}
            </div>
            <p className="mt-2 text-xs italic leading-relaxed text-emerald-100/90 font-serif">
              «{currentRank.motto}»
            </p>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Score & Accuracy Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">Точность</span>
              <div className={`mt-1 font-mono text-3xl font-extrabold ${isPassed ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                {result.accuracy}%
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">Верно</span>
              <div className="mt-1 font-mono text-3xl font-extrabold text-slate-900 dark:text-white">
                {result.correctAnswers} / {result.totalQuestions}
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">Вердикт</span>
              <div className="mt-1 font-bold text-base flex items-center justify-center gap-1.5 pt-1">
                {isPassed ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                    <Check className="h-5 w-5 stroke-[3]" /> Зачёт сдан
                  </span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-bold">
                    <X className="h-5 w-5 stroke-[3]" /> Требует повтора
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Academic Progression Rank Bar */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-600 dark:text-slate-300">Прогрессия званий</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{totalGlobalProgressPct}% курса</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(5, totalGlobalProgressPct))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
              <span>{ACADEMIC_RANKS[0].title.split(" ")[0]}</span>
              <span>{ACADEMIC_RANKS[ACADEMIC_RANKS.length - 1].title.split(" ")[0]}</span>
            </div>
          </div>

          {/* Unlocked Achievements Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">
                Коллекция научных достижений ({allUnlockedAchievementIds.length} / {ACHIEVEMENTS.length})
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {ACHIEVEMENTS.map((ach) => {
                const isUnlocked = allUnlockedAchievementIds.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    title={`${ach.title}: ${ach.description}`}
                    className={`flex flex-col items-center rounded-xl border p-2.5 text-center transition-all ${
                      isUnlocked
                        ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-slate-900 dark:text-white shadow-sm"
                        : "border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/20 text-slate-400 opacity-40 grayscale"
                    }`}
                  >
                    <span className="text-2xl mb-1">{ach.badgeIcon}</span>
                    <span className="text-[11px] font-semibold leading-tight line-clamp-2">{ach.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mistakes summary block */}
          {result.mistakes.length > 0 && (
            <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-white font-mono text-xs font-bold">
                    ✕
                  </span>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 font-mono">
                      Ошибок в тестировании: {result.mistakes.length}
                    </span>
                    <p className="text-xs text-rose-700/80 dark:text-rose-400">
                      Рекомендуется пройти работу над ошибками
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMistakesDetail((v) => !v)}
                  className="rounded-lg bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 shadow-sm hover:bg-rose-50 transition-colors"
                >
                  {showMistakesDetail ? "Скрыть разбор" : "Разобрать ошибки"}
                </button>
              </div>

              {/* Detailed Mistakes List when expanded */}
              {showMistakesDetail && (
                <div className="mt-4 space-y-3 pt-3 border-t border-rose-200 dark:border-rose-900/50">
                  {result.mistakes.map((m, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs shadow-sm"
                    >
                      <div className="font-semibold text-slate-900 dark:text-white mb-1.5">
                        {idx + 1}. {m.step.title}
                      </div>
                      <div className="text-rose-600 dark:text-rose-400 mb-1">
                        Ваш ответ: <span className="font-mono">{String(m.userAnswer)}</span>
                      </div>
                      <div className="text-emerald-700 dark:text-emerald-400 font-medium mb-1.5">
                        Правильно: {m.correctAnswerText}
                      </div>
                      {m.explanation && (
                        <div className="text-slate-600 dark:text-slate-300 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                          {m.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onRetake}
          className="press flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <RotateCcw className="h-4 w-4" /> Повторить тест
        </button>
        {result.mistakes.length > 0 && (
          <button
            type="button"
            onClick={onReviewMistakes}
            className="press flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors"
          >
            Разобрать ошибки в тренажере
          </button>
        )}
        <button
          type="button"
          onClick={onHome}
          className="press flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-semibold text-white shadow-md shadow-emerald-600/20 transition-all"
        >
          Вернуться на главную <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </main>
  );
}
