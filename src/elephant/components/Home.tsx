import { useState } from "react";
import type { Course, UserProgress } from "../../types/course";
import {
  getStepStatus,
  percent,
  getAcademicRank,
  formatModuleHeader,
  formatLessonTitle,
  findTargetLessonId,
  ACHIEVEMENTS,
  ACADEMIC_RANKS,
  type MistakeEntry,
} from "../progress";
import { Check, Share2, X } from "lucide-react";

interface Props {
  courses: Course[];
  course: Course;
  progress: UserProgress | undefined;
  store: Record<string, UserProgress | undefined>;
  mistakes: MistakeEntry[];
  resumeLabel: string;
  totalGlobalProgressPct: number;
  unlockedAchievements: string[];
  onResume: () => void;
  onOpen: (courseId: string, stepId: string) => void;
  onSelectCourse: (id: string) => void;
  onStartGlobalExam: () => void;
  onStartCourseExam: (courseId: string) => void;
}

export default function Home(p: Props) {
  const displayGlobalPct = Math.max(1, p.totalGlobalProgressPct);
  const currentRank = getAcademicRank(p.totalGlobalProgressPct);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [copiedCert, setCopiedCert] = useState(false);

  const targetLessonId = findTargetLessonId(p.course, p.progress);

  const courseSteps = p.course.modules.flatMap((m) =>
    m.lessons.flatMap((l) => l.steps)
  );
  const courseDoneCount = courseSteps.filter(
    (s) => getStepStatus(s, p.progress) !== "idle"
  ).length;
  const courseCleanTitle = p.course.title.replace(/^Трек\s+[IVX\d]+\s*:\s*/i, "");

  const handleCopyCertificate = async () => {
    const text = `🎓 Слонология.EDU — Академический статус\nРанг: ${currentRank.title} (${displayGlobalPct}%)\nНаграды: ${p.unlockedAchievements.length}/${ACHIEVEMENTS.length}\nДевиз: «${currentRank.motto}»`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopiedCert(true);
      setTimeout(() => setCopiedCert(false), 2200);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 pb-20 pt-3.5 space-y-4">
      {/* 1. Single Calm Status Bar: Rank + Achievements Chip + Global Exam */}
      <div className="flex items-center justify-between gap-2 text-xs py-0.5">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => setShowAchievementsModal(true)}
            title={currentRank.title}
            className="press inline-flex items-center gap-1.5 text-left text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap"
          >
            <span className="font-medium">{currentRank.shortTitle}</span>
            <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
              {displayGlobalPct}%
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowAchievementsModal(true)}
            aria-label={`Коллекция научных достижений: ${p.unlockedAchievements.length} из ${ACHIEVEMENTS.length}`}
            className="press inline-flex items-center gap-1 rounded-md border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 px-2 py-0.5 font-mono tabular-nums text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shrink-0"
          >
            <span aria-hidden="true">🏆</span>
            <span>
              {p.unlockedAchievements.length}/{ACHIEVEMENTS.length}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={p.onStartGlobalExam}
          className="press inline-flex items-center gap-1 rounded-md border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0 whitespace-nowrap"
        >
          <span aria-hidden="true">⚡</span>
          <span>Экзамен</span>
        </button>
      </div>

      {/* 2. Horizontal Theme Selector */}
      <div className="space-y-2">
        <div
          role="tablist"
          aria-label="Темы курса"
          className="overflow-x-auto no-scrollbar scrollbar-none scroll-smooth flex items-center gap-1.5 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {p.courses.map((c, i) => {
            const steps = c.modules.flatMap((m) =>
              m.lessons.flatMap((l) => l.steps)
            );
            const done = p.store[c.id]?.completedSteps.length ?? 0;
            const active = c.id === p.course.id;
            const pct = percent(done, steps.length);
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => p.onSelectCourse(c.id)}
                className={`press h-8 shrink-0 rounded-lg border px-2.5 text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  active
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-semibold"
                    : "border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <span>Тема {i + 1}</span>
                <span
                  className={`font-mono tabular-nums text-[11px] ${
                    active
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {pct}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Theme Context Bar */}
        <div className="flex items-center justify-between gap-4 pt-0.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300 break-words">
            {courseCleanTitle}
          </span>
          <span className="font-mono tabular-nums shrink-0 text-[11px]">
            {courseDoneCount}/{courseSteps.length}
          </span>
        </div>
      </div>

      {/* 3. Modules & Minimalist Lesson List */}
      <div className="space-y-4">
        {p.course.modules.map((m, modIdx) => {
          const modMeta = formatModuleHeader(m.title, modIdx);
          return (
            <section key={m.id} className="space-y-1.5">
              <div className="flex items-baseline gap-2 px-0.5">
                <h3 className="text-xs text-slate-500 dark:text-slate-400 font-mono tracking-wider">
                  {modMeta.code}
                  {modMeta.name ? ` · ${modMeta.name}` : ""}
                </h3>
              </div>

              <div className="grid gap-2">
                {m.lessons.map((l, lesIdx) => {
                  const sts = l.steps.map((s) => getStepStatus(s, p.progress));
                  const done = sts.filter((s) => s !== "idle").length;
                  const wrong = sts.filter((s) => s === "wrong").length;
                  const isCompleted = l.steps.length > 0 && done === l.steps.length;
                  const firstStep =
                    l.steps.find((_, i) => sts[i] === "idle") ?? l.steps[0];
                  const lessonMeta = formatLessonTitle(
                    l.title,
                    `${modIdx}.${lesIdx + 1}`
                  );
                  const isTargetLesson = l.id === targetLessonId && !isCompleted;

                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() =>
                        firstStep && p.onOpen(p.course.id, firstStep.id)
                      }
                      className={`press group w-full flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                        isTargetLesson
                          ? "border-emerald-500/50 dark:border-emerald-500/50 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06] hover:bg-emerald-500/[0.08]"
                          : "bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-900/90"
                      }`}
                    >
                      {/* Left: Lesson Index Badge + Full Unwrapped Title */}
                      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                        <span
                          className={`mt-0.5 sm:mt-0 flex h-7 w-9 shrink-0 items-center justify-center rounded-lg border font-mono text-[11px] tabular-nums transition-colors ${
                            isCompleted
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                              : isTargetLesson
                              ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold"
                              : done > 0
                              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                              : "border-slate-200/80 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          ) : (
                            lessonMeta.code
                          )}
                        </span>

                        <div className="min-w-0 flex-1">
                          <span className="block text-[14px] leading-snug font-medium text-slate-900 dark:text-slate-100 break-words whitespace-normal">
                            {lessonMeta.title}
                          </span>
                          {isTargetLesson && (
                            <span className="mt-0.5 inline-block sm:hidden text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              Продолжить →
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Continue Prompt + Monospace Counters */}
                      <div className="flex items-center gap-2.5 shrink-0 font-mono text-xs tabular-nums">
                        {isTargetLesson && (
                          <span className="hidden sm:inline font-sans text-xs font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                            Продолжить →
                          </span>
                        )}
                        <span className="text-slate-400 dark:text-slate-500">
                          {done}/{l.steps.length}
                        </span>
                        {wrong > 0 && (
                          <span
                            className="text-rose-600 dark:text-rose-400 font-semibold whitespace-nowrap"
                            title={`Ошибок: ${wrong}`}
                          >
                            ✕ {wrong}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* 4. Bottom Theme Exam Row */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => p.onStartCourseExam(p.course.id)}
            className="press flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 px-3.5 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <span aria-hidden="true">📝</span>
              <span className="break-words text-left">
                Зачёт по теме (без подсказок)
              </span>
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 shrink-0">
              →
            </span>
          </button>
        </div>
      </div>

      {/* 5. Mistakes Review List */}
      {p.mistakes.length > 0 && (
        <section className="pt-2 space-y-2">
          <h3 className="text-xs font-mono tracking-wider text-slate-500 dark:text-slate-400">
            Работа над ошибками ({p.mistakes.length})
          </h3>
          <div className="divide-y divide-slate-200/70 dark:divide-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden">
            {p.mistakes.map((e) => (
              <button
                key={e.step.id}
                type="button"
                onClick={() => p.onOpen(e.courseId, e.step.id)}
                className="flex min-h-11 w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                  <span className="font-mono font-semibold text-rose-600 dark:text-rose-400 shrink-0">
                    ✕
                  </span>
                  <span className="min-w-0 flex-1 break-words whitespace-normal text-slate-800 dark:text-slate-200 font-medium">
                    {e.step.title}
                  </span>
                </div>
                <span className="shrink-0 font-mono text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  {e.courseTitle.split(":")[0].replace("Трек", "Тема")}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 6. Achievements & Academic Certificate Modal */}
      {showAchievementsModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="achievements-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
        >
          <div className="max-h-[88vh] w-full max-w-xl overflow-y-auto no-scrollbar rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-5 sm:p-6 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-mono tracking-wider text-emerald-600 dark:text-emerald-400">
                  Личное дело · Слонология.EDU
                </span>
                <h2
                  id="achievements-modal-title"
                  className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mt-0.5"
                >
                  Академический статус и награды
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAchievementsModal(false)}
                aria-label="Закрыть окно наград"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Screenshot-Ready Certificate Card */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.05] dark:bg-emerald-500/[0.06] p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                  Присвоенное звание · {displayGlobalPct}% курса
                </span>
                <button
                  type="button"
                  onClick={handleCopyCertificate}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                >
                  <Share2 className="h-3 w-3" />
                  <span>{copiedCert ? "Скопировано" : "Поделиться"}</span>
                </button>
              </div>

              <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                {currentRank.title}
              </div>

              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 italic">
                «{currentRank.motto}»
              </p>

              {/* Rank Progression Bar */}
              <div className="pt-1 space-y-1.5">
                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(4, displayGlobalPct))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  <span>{ACADEMIC_RANKS[0].shortTitle}</span>
                  <span>
                    {ACADEMIC_RANKS[ACADEMIC_RANKS.length - 1].shortTitle}
                  </span>
                </div>
              </div>
            </div>

            {/* Achievements List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500 dark:text-slate-400">
                  Научные знаки отличия
                </span>
                <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                  {p.unlockedAchievements.length} / {ACHIEVEMENTS.length}
                </span>
              </div>

              <div className="grid gap-2">
                {ACHIEVEMENTS.map((ach) => {
                  const isUnlocked = p.unlockedAchievements.includes(ach.id);
                  return (
                    <div
                      key={ach.id}
                      className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                        isUnlocked
                          ? "border-emerald-500/40 bg-emerald-500/[0.04] text-slate-900 dark:text-slate-100"
                          : "border-slate-200/70 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 opacity-65"
                      }`}
                    >
                      <span className="text-2xl shrink-0 leading-none mt-0.5">
                        {ach.badgeIcon}
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                            {ach.title}
                          </span>
                          <span
                            className={`font-mono text-[10px] shrink-0 ${
                              isUnlocked
                                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                                : "text-slate-400 dark:text-slate-500"
                            }`}
                          >
                            {isUnlocked ? "Получено ✓" : "Закрыто"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {ach.description}
                        </p>
                        <span className="block font-mono text-[11px] text-slate-400 dark:text-slate-500">
                          Условие: {ach.conditionText}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAchievementsModal(false)}
              className="press h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/90 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
