import { useState, useEffect, useCallback, useMemo } from "react";
import confetti from "canvas-confetti";
import TopBar from "./elephant/components/TopBar";
import Home from "./elephant/components/Home";
import ExamSummary, { type ExamResult } from "./elephant/components/ExamSummary";
import QuizScreen from "./elephant/components/quiz/QuizScreen";
import { Theory, Quiz, Scenario, Flashcards } from "./elephant/components/steps";
import { COURSES_DATA } from "./data/coursesData";
import type { UserProgress, Step } from "./types/course";
import { getLessonContext } from "./utils/courseUtils";
import { collectMistakes, stepsOf, checkUnlockedAchievements } from "./elephant/progress";
import { isSoundEnabled, setSoundEnabled, playCorrect, playWrong, playClick } from "./elephant/sound";

const STORAGE_KEY = "elephantology-edu-progress";
const COURSE_KEY = "elephantology-current-course";
const THEME_KEY = "elephantology-dark-theme";

type ProgressStore = Record<string, UserProgress | undefined>;
type View = "HOME" | "STEP" | "EXAM" | "EXAM_SUMMARY" | "QUIZ";

const FIRST_COURSE = COURSES_DATA[0]!;

function loadProgress(): ProgressStore {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (parsed && typeof parsed === "object") return parsed;
  } catch (e) {
    console.error("Failed to load progress:", e);
  }
  return {};
}

function createDefaultProgress(courseId: string, currentStepId = ""): UserProgress {
  const now = new Date().toISOString();
  return {
    courseId,
    completedSteps: [],
    currentStepId,
    score: 0,
    bookmarks: [],
    quizAnswers: {},
    scenarioAnswers: {},
    startedAt: now,
    lastActivity: now,
  };
}

export default function App() {
  const [store, setStore] = useState<ProgressStore>(loadProgress);
  const [courseId, setCourseId] = useState<string>(() => localStorage.getItem(COURSE_KEY) || FIRST_COURSE.id);
  const [view, setView] = useState<View>("HOME");
  const [pending, setPending] = useState<number | null>(null);
  const [flashcardProgress, setFlashcardProgress] = useState<Record<string, number>>({});

  // Dark Mode State (defaults to Linear/Raycast deep graphite dark theme)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Sound State
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  const toggleDark = () => {
    playClick();
    setIsDark((prev) => !prev);
  };

  // Exam Session State
  const [examTitle, setExamTitle] = useState("Экзамен");
  const [examQuestions, setExamQuestions] = useState<Step[]>([]);
  const [examIdx, setExamIdx] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<string, number | string>>({});
  const [examPending, setExamPending] = useState<number | null>(null);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  const course = COURSES_DATA.find((c) => c.id === courseId) ?? FIRST_COURSE;
  const steps = useMemo(() => stepsOf(course), [course]);

  const progress: UserProgress = useMemo(() => {
    const ex = store[course.id];
    const fallback = steps[0]?.id ?? "";
    if (!ex) return createDefaultProgress(course.id, fallback);
    return {
      ...createDefaultProgress(course.id),
      ...ex,
      completedSteps: Array.isArray(ex.completedSteps) ? ex.completedSteps : [],
      bookmarks: Array.isArray(ex.bookmarks) ? ex.bookmarks : [],
      quizAnswers: ex.quizAnswers || {},
      scenarioAnswers: ex.scenarioAnswers || {},
      currentStepId: steps.some((s) => s.id === ex.currentStepId) ? ex.currentStepId : fallback,
    };
  }, [store, course.id, steps]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      /* quota */
    }
  }, [store]);

  useEffect(() => {
    try {
      localStorage.setItem(COURSE_KEY, courseId);
    } catch {
      /* quota */
    }
  }, [courseId]);

  const idx = Math.max(0, steps.findIndex((s) => s.id === progress.currentStepId));
  const step = steps[idx]!;
  const ctx = getLessonContext(course, step.id);
  const mistakes = useMemo(() => collectMistakes(COURSES_DATA, store), [store]);
  const courseMistakes = mistakes.filter((m) => m.courseId === course.id).length;

  // Global calculations for ranks and achievements
  const allStepsCount = useMemo(() => COURSES_DATA.flatMap((c) => stepsOf(c)).length, []);
  const allCompletedStepsCount = useMemo(() => {
    let count = 0;
    for (const cid in store) {
      count += store[cid]?.completedSteps?.length || 0;
    }
    return count;
  }, [store]);
  const totalGlobalProgressPct = Math.min(100, Math.round((allCompletedStepsCount / (allStepsCount || 1)) * 100));
  const unlockedAchievements = useMemo(() => checkUnlockedAchievements(store), [store]);

  useEffect(() => setPending(null), [step.id]);

  const update = useCallback((cid: string, fn: (p: UserProgress) => UserProgress) => {
    setStore((prev) => {
      const c = COURSES_DATA.find((x) => x.id === cid) ?? FIRST_COURSE;
      const base = prev[cid] ?? createDefaultProgress(cid, stepsOf(c)[0]?.id ?? "");
      return { ...prev, [cid]: fn(base) };
    });
  }, []);

  const goTo = useCallback(
    (id: string) => {
      update(course.id, (p) => ({ ...p, currentStepId: id, lastActivity: new Date().toISOString() }));
      setView("STEP");
      window.scrollTo({ top: 0 });
    },
    [course.id, update]
  );

  const complete = useCallback(
    (id: string) => {
      update(course.id, (p) =>
        p.completedSteps.includes(id)
          ? p
          : {
              ...p,
              completedSteps: [...p.completedSteps, id],
              score: (p.score || 0) + 10,
              lastActivity: new Date().toISOString(),
            }
      );
    },
    [course.id, update]
  );

  const answered =
    step.type === "QUIZ"
      ? progress.quizAnswers[step.id] !== undefined
      : step.type === "SCENARIO"
      ? progress.scenarioAnswers[step.id] !== undefined
      : true;
  const needsConfirm = (step.type === "QUIZ" || step.type === "SCENARIO") && !answered;
  const isLast = idx === steps.length - 1;

  const flashcardTotal = step.type === "FLASHCARD" ? step.cards.length : 0;
  const evaluatedCount = step.type === "FLASHCARD" ? flashcardProgress[step.id] || 0 : 0;
  const flashcardRemaining = flashcardTotal - evaluatedCount;
  const flashcardDone = step.type === "FLASHCARD" ? flashcardRemaining <= 0 : true;

  const confirm = useCallback(() => {
    if (pending === null) return;
    if (step.type === "QUIZ") {
      const isCorrect = pending === step.correctAnswer;
      if (isCorrect) playCorrect();
      else playWrong();
      update(course.id, (p) => ({ ...p, quizAnswers: { ...p.quizAnswers, [step.id]: pending } }));
    } else if (step.type === "SCENARIO") {
      const opt = step.options[pending];
      if (!opt) return;
      if (opt.isCorrect) playCorrect();
      else playWrong();
      update(course.id, (p) => ({ ...p, scenarioAnswers: { ...p.scenarioAnswers, [step.id]: opt.id } }));
    }
    complete(step.id);
  }, [pending, step, course.id, update, complete]);

  const next = useCallback(() => {
    complete(step.id);
    const n = steps[idx + 1];
    if (n) goTo(n.id);
    else {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } });
      setView("HOME");
    }
  }, [complete, step.id, steps, idx, goTo]);

  const prev = useCallback(() => {
    const p = steps[idx - 1];
    if (p) goTo(p.id);
  }, [steps, idx, goTo]);

  const primary = step.type === "FLASHCARD" ? (flashcardDone ? next : () => {}) : needsConfirm ? confirm : next;

  // --- Exam Mode Methods ---
  const startGlobalExam = () => {
    const allTestingSteps: Step[] = [];
    for (const c of COURSES_DATA) {
      for (const m of c.modules) {
        for (const l of m.lessons) {
          for (const s of l.steps) {
            if (s.type === "QUIZ" || s.type === "SCENARIO") {
              allTestingSteps.push(s);
            }
          }
        }
      }
    }
    const shuffled = [...allTestingSteps].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(20, shuffled.length));

    setExamTitle("Глобальный экзамен");
    setExamQuestions(selected);
    setExamIdx(0);
    setExamAnswers({});
    setExamPending(null);
    setView("EXAM");
    window.scrollTo({ top: 0 });
  };

  const startCourseExam = (cid: string) => {
    const targetCourse = COURSES_DATA.find((c) => c.id === cid) ?? course;
    const testingSteps: Step[] = [];
    for (const m of targetCourse.modules) {
      for (const l of m.lessons) {
        for (const s of l.steps) {
          if (s.type === "QUIZ" || s.type === "SCENARIO") {
            testingSteps.push(s);
          }
        }
      }
    }
    setExamTitle(`Зачёт: ${targetCourse.title.split(":")[0].replace("Трек", "Тема")}`);
    setExamQuestions(testingSteps);
    setExamIdx(0);
    setExamAnswers({});
    setExamPending(null);
    setView("EXAM");
    window.scrollTo({ top: 0 });
  };

  const startQuiz = () => {
    setView("QUIZ");
    window.scrollTo({ top: 0 });
  };

  const currentExamStep = examQuestions[examIdx];

  const handleExamOptionPick = (optionIdx: number) => {
    setExamPending(optionIdx);
  };

  const handleExamNext = () => {
    if (!currentExamStep) return;

    const currentRecorded = { ...examAnswers };
    if (examPending !== null) {
      if (currentExamStep.type === "QUIZ") {
        currentRecorded[currentExamStep.id] = examPending;
      } else if (currentExamStep.type === "SCENARIO") {
        const opt = currentExamStep.options[examPending];
        if (opt) currentRecorded[currentExamStep.id] = opt.id;
      }
      setExamAnswers(currentRecorded);
    }

    if (examIdx < examQuestions.length - 1) {
      setExamIdx((prev) => prev + 1);
      setExamPending(null);
      window.scrollTo({ top: 0 });
    } else {
      finishExam(currentRecorded);
    }
  };

  const handleExamPrev = () => {
    if (examIdx > 0) {
      setExamIdx((prev) => prev - 1);
      setExamPending(null);
      window.scrollTo({ top: 0 });
    }
  };

  const finishExam = (answersMap: Record<string, number | string>) => {
    let correct = 0;
    const mistakesDetail: ExamResult["mistakes"] = [];

    examQuestions.forEach((q) => {
      const ans = answersMap[q.id];
      if (q.type === "QUIZ") {
        const isRight = ans === q.correctAnswer;
        if (isRight) {
          correct++;
        } else {
          mistakesDetail.push({
            step: q,
            userAnswer: ans !== undefined ? q.options[ans as number] || "Нет ответа" : "Нет ответа",
            correctAnswerText: q.options[q.correctAnswer] || "",
            explanation: q.explanation,
          });
        }
      } else if (q.type === "SCENARIO") {
        const chosenOpt = q.options.find((o) => o.id === ans);
        const correctOpt = q.options.find((o) => o.isCorrect);
        if (chosenOpt?.isCorrect) {
          correct++;
        } else {
          mistakesDetail.push({
            step: q,
            userAnswer: chosenOpt?.text || "Нет ответа",
            correctAnswerText: correctOpt?.text || "",
            explanation: chosenOpt?.feedback || correctOpt?.feedback,
          });
        }
      }
    });

    const accuracy = Math.round((correct / (examQuestions.length || 1)) * 100);
    const dateFormatted = new Date().toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    if (accuracy >= 70) {
      playCorrect();
      if (accuracy >= 80) {
        confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
      }
    } else {
      playWrong();
    }

    setExamResult({
      title: examTitle,
      totalQuestions: examQuestions.length,
      correctAnswers: correct,
      accuracy,
      dateStr: dateFormatted,
      mistakes: mistakesDetail,
    });
    setView("EXAM_SUMMARY");
  };

  // Keyboard navigation
  useEffect(() => {
    if (view === "STEP") {
      const h = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLElement && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
        if (e.key === "ArrowRight") next();
        else if (e.key === "ArrowLeft") prev();
        else if (e.key === "Enter") {
          e.preventDefault();
          if (step.type === "FLASHCARD" && !flashcardDone) return;
          primary();
        } else if (needsConfirm && /^[1-9]$/.test(e.key)) {
          const i = Number(e.key) - 1;
          const n = step.type === "QUIZ" || step.type === "SCENARIO" ? step.options.length : 0;
          if (i < n) setPending(i);
        }
      };
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }

    if (view === "EXAM") {
      const h = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLElement && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
        if (e.key === "Enter") {
          e.preventDefault();
          handleExamNext();
        } else if (currentExamStep && (currentExamStep.type === "QUIZ" || currentExamStep.type === "SCENARIO")) {
          if (/^[1-9]$/.test(e.key)) {
            const i = Number(e.key) - 1;
            const n = currentExamStep.options.length;
            if (i < n) handleExamOptionPick(i);
          }
        }
      };
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }
  }, [view, next, prev, primary, needsConfirm, step, flashcardDone, examPending, examIdx, examQuestions]);

  const selectCourse = (id: string, stepId?: string) => {
    setCourseId(id);
    if (stepId) {
      update(id, (p) => ({ ...p, currentStepId: stepId, lastActivity: new Date().toISOString() }));
      setView("STEP");
      window.scrollTo({ top: 0 });
    }
  };

  const primaryLabel =
    step.type === "FLASHCARD"
      ? flashcardDone
        ? "Термины изучены — перейти далее"
        : `Изучите все карточки (осталось ${flashcardRemaining})`
      : needsConfirm
      ? "Ответить"
      : step.type === "THEORY" && !progress.completedSteps.includes(step.id)
      ? "Прочитано — далее"
      : isLast
      ? "Завершить тему"
      : "Далее";

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <TopBar
        steps={view === "EXAM" ? examQuestions : steps}
        currentStepId={view === "EXAM" ? currentExamStep?.id ?? null : view === "STEP" ? step.id : null}
        progress={store[course.id]}
        score={progress.score}
        mistakes={courseMistakes}
        streak={0}
        soundEnabled={soundOn}
        isDark={isDark}
        isExamMode={view === "EXAM"}
        examAnsweredMap={
          view === "EXAM"
            ? Object.fromEntries(Object.keys(examAnswers).map((k) => [k, true]))
            : undefined
        }
        onToggleSound={toggleSound}
        onToggleDark={toggleDark}
        onSelectStep={view === "EXAM" ? (id) => setExamIdx(examQuestions.findIndex((q) => q.id === id)) : goTo}
        onHome={() => setView("HOME")}
      />

      {view === "HOME" && (
        <Home
          courses={COURSES_DATA}
          course={course}
          progress={store[course.id]}
          store={store}
          mistakes={mistakes}
          resumeLabel={`${ctx.cleanLessonTitle} · ${step.title}`}
          totalGlobalProgressPct={totalGlobalProgressPct}
          unlockedAchievements={unlockedAchievements}
          onResume={() => setView("STEP")}
          onOpen={(cid, sid) => selectCourse(cid, sid)}
          onSelectCourse={(id) => selectCourse(id)}
          onStartGlobalExam={startGlobalExam}
          onStartCourseExam={startCourseExam}
          onStartQuiz={startQuiz}
        />
      )}

      {view === "STEP" && (
        <>
          <main className="mx-auto max-w-2xl px-4 pb-36 pt-4">
            <div className="mb-4 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => setView("HOME")}
                className="h-8 truncate text-left hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                ← {ctx.cleanLessonTitle}
              </button>
              <span className="shrink-0 font-mono">
                {idx + 1} / {steps.length}
              </span>
            </div>

            {step.type === "THEORY" && <Theory step={step} />}
            {step.type === "QUIZ" && (
              <Quiz
                step={step}
                answer={progress.quizAnswers[step.id]}
                pending={pending}
                exam={false}
                onPick={setPending}
              />
            )}
            {step.type === "SCENARIO" && (
              <Scenario
                step={step}
                answer={progress.scenarioAnswers[step.id]}
                pending={pending}
                exam={false}
                onPick={setPending}
              />
            )}
            {step.type === "FLASHCARD" && (
              <Flashcards
                step={step}
                onProgress={(count) => setFlashcardProgress((prev) => ({ ...prev, [step.id]: count }))}
              />
            )}
          </main>

          <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg pb-[env(safe-area-inset-bottom)] transition-colors">
            <div className="mx-auto flex max-w-2xl gap-2 px-4 py-3">
              <button
                type="button"
                onClick={prev}
                disabled={idx === 0}
                className="h-12 w-14 shrink-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg shadow-sm disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                aria-label="Назад"
              >
                ←
              </button>
              <button
                type="button"
                onClick={primary}
                disabled={(needsConfirm && pending === null) || (step.type === "FLASHCARD" && !flashcardDone)}
                className={`h-12 flex-1 rounded-xl font-medium shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  step.type === "FLASHCARD" && flashcardDone
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 shadow-md"
                    : step.type === "FLASHCARD"
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-500"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {primaryLabel} <span className="ml-1 hidden font-mono text-xs opacity-75 sm:inline">Enter</span>
              </button>
            </div>
          </nav>
        </>
      )}

      {view === "EXAM" && currentExamStep && (
        <>
          <main className="mx-auto max-w-2xl px-4 pb-36 pt-4">
            <div className="mb-4 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{examTitle}</span>
                <span>• без подсказок</span>
              </div>
              <span className="shrink-0 font-mono">
                {examIdx + 1} / {examQuestions.length}
              </span>
            </div>

            {currentExamStep.type === "QUIZ" && (
              <Quiz
                step={currentExamStep}
                answer={undefined}
                pending={
                  examPending !== null
                    ? examPending
                    : examAnswers[currentExamStep.id] !== undefined
                    ? (examAnswers[currentExamStep.id] as number)
                    : null
                }
                exam={true}
                onPick={handleExamOptionPick}
              />
            )}

            {currentExamStep.type === "SCENARIO" && (
              <Scenario
                step={currentExamStep}
                answer={undefined}
                pending={
                  examPending !== null
                    ? examPending
                    : examAnswers[currentExamStep.id] !== undefined
                    ? currentExamStep.options.findIndex((o) => o.id === examAnswers[currentExamStep.id])
                    : null
                }
                exam={true}
                onPick={handleExamOptionPick}
              />
            )}
          </main>

          <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg pb-[env(safe-area-inset-bottom)] transition-colors">
            <div className="mx-auto flex max-w-2xl gap-2 px-4 py-3">
              <button
                type="button"
                onClick={handleExamPrev}
                disabled={examIdx === 0}
                className="h-12 w-14 shrink-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg shadow-sm disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                aria-label="Назад"
              >
                ←
              </button>
              <button
                type="button"
                onClick={handleExamNext}
                className="h-12 flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-medium text-white shadow-sm transition-all"
              >
                {examIdx === examQuestions.length - 1 ? "Завершить экзамен" : "Следующий вопрос"}{" "}
                <span className="ml-1 hidden font-mono text-xs opacity-75 sm:inline">Enter</span>
              </button>
            </div>
          </nav>
        </>
      )}

      {view === "QUIZ" && <QuizScreen onExit={() => setView("HOME")} />}

      {view === "EXAM_SUMMARY" && examResult && (
        <ExamSummary
          result={examResult}
          allUnlockedAchievementIds={unlockedAchievements}
          totalGlobalProgressPct={totalGlobalProgressPct}
          onReviewMistakes={() => {
            setView("HOME");
          }}
          onHome={() => setView("HOME")}
          onRetake={() => {
            if (examQuestions.length > 0) {
              setExamIdx(0);
              setExamAnswers({});
              setExamPending(null);
              setView("EXAM");
            } else {
              setView("HOME");
            }
          }}
        />
      )}
    </div>
  );
}
