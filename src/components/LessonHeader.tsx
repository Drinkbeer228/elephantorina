import { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  Moon,
  Sun,
  Trophy,
  BookOpen,
  HelpCircle,
  FlaskConical,
  Layers,
  Check,
} from 'lucide-react';
import { Step, StepType } from '../types/course';

/* ============================================================
   LessonHeader — нативный мобильный интерфейс Stepik (iOS)
   1. Top App Bar (~52px, sticky, safe-area): «Назад» / номер и
      название урока (truncate) / счётчик + переключатель темы.
   2. Горизонтальная лента шагов: иконки по типу шага, акцентная
      линия-индикатор под активным шагом, бейдж ✓ у сданных,
      горизонтальная прокрутка без скроллбара.
   ============================================================ */

export type StepTabStatus = 'active' | 'completed' | 'inactive';

interface LessonHeaderProps {
  /** Название текущего урока, напр. «Таксономия и генотипы EEHV» */
  lessonTitle: string;
  /** Отображаемый номер урока, напр. «1.1» */
  lessonNumber?: string;
  /** Шаги текущего урока */
  steps: Step[];
  /** ID активного шага */
  currentStepId: string;
  /** Сданные шаги */
  completedSteps: string[];
  /** Мгновенное переключение шага без перезагрузки */
  onSelectStep: (stepId: string) => void;
  /** Возврат к списку уроков курса (Dashboard / Modules view) */
  onBack: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  score?: number;
}

/** Иконка шага в стиле нативного приложения Stepik для iOS */
function StepIcon({ type, className }: { type: StepType; className?: string }) {
  switch (type) {
    case 'THEORY': // текст / теория — иконка строк документа
      return <BookOpen className={className} aria-hidden="true" />;
    case 'QUIZ': // тест — знак вопроса
      return <HelpCircle className={className} aria-hidden="true" />;
    case 'SCENARIO': // интерактивный симулятор — колба
      return <FlaskConical className={className} aria-hidden="true" />;
    case 'FLASHCARD': // 3D-флешкарты — стопка карточек
      return <Layers className={className} aria-hidden="true" />;
    default:
      return <BookOpen className={className} aria-hidden="true" />;
  }
}

const STEP_TYPE_LABEL: Record<StepType, string> = {
  THEORY: 'Теория',
  QUIZ: 'Тест',
  SCENARIO: 'Симулятор',
  FLASHCARD: 'Карточки',
};

export default function LessonHeader({
  lessonTitle,
  lessonNumber,
  steps,
  currentStepId,
  completedSteps,
  onSelectStep,
  onBack,
  darkMode,
  onToggleDarkMode,
  score = 0,
}: LessonHeaderProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Автопрокрутка активной вкладки в центр ленты при смене шага
  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;
    const active = container.querySelector<HTMLElement>('[data-active="true"]');
    if (!active) return;
    const target =
      active.offsetLeft - container.clientWidth / 2 + active.clientWidth / 2;
    container.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [currentStepId]);

  const completedCount = steps.filter((s) =>
    completedSteps.includes(s.id)
  ).length;

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl">
      {/* ===== Top App Bar (~52px + safe-area) ===== */}
      <div className="pt-safe h-[52px] flex items-center gap-1 px-1.5 sm:px-3">
        {/* Назад — к списку уроков курса */}
        <button
          onClick={onBack}
          aria-label="К списку уроков"
          className="shrink-0 -ml-1 flex items-center gap-0.5 pl-1 pr-2 py-2 rounded-xl text-[#0593C6] dark:text-[#3BA8D8] active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-7 h-7" strokeWidth={2} />
          <span className="hidden sm:inline text-sm font-medium">Уроки</span>
        </button>

        {/* Центр: номер + название урока (truncate) */}
        <div className="flex-1 min-w-0 text-center select-none">
          <p className="text-[15px] font-semibold text-slate-900 dark:text-slate-50 truncate leading-tight">
            {lessonNumber && (
              <span className="text-slate-400 dark:text-slate-500 font-medium mr-1">
                {lessonNumber}
              </span>
            )}
            {lessonTitle}
          </p>
        </div>

        {/* Справа: очки, тема / меню */}
        <div className="shrink-0 flex items-center gap-0.5">
          <div
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50"
            title={`Очки: ${score}`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              {score}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Информация о уроке"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none" />
                <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
                <circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-60 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#121212] shadow-xl z-20 p-1.5">
                  <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Об уроке
                  </p>
                  <p className="px-3 pb-2 text-sm text-slate-700 dark:text-slate-200 leading-snug">
                    {lessonNumber ? `${lessonNumber} · ` : ''}
                    {lessonTitle}
                  </p>
                  <div className="px-3 pb-2 text-xs text-slate-500 dark:text-slate-400">
                    Шаг {Math.max(steps.findIndex((s) => s.id === currentStepId) + 1, 1)}{' '}
                    из {steps.length} · Сдано {completedCount}/{steps.length}
                  </div>
                  <div className="h-px bg-slate-200 dark:bg-slate-700/70 my-1" />
                  <button
                    onClick={() => {
                      onToggleDarkMode();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {darkMode ? (
                      <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-slate-500" />
                    )}
                    {darkMode ? 'Светлая тема' : 'Тёмная тема'}
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onBack();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#0593C6] dark:text-[#3BA8D8]" />
                    К списку уроков
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== Лента шагов (Stepik-style step tabs) ===== */}
      <nav
        ref={tabsRef}
        aria-label="Шаги урока"
        className="relative w-full overflow-x-auto no-scrollbar touch-pan-x border-t border-slate-100 dark:border-slate-800"
      >
        <ul className="flex items-stretch w-max min-w-full mx-auto">
          {steps.map((step, index) => {
            const isActive = step.id === currentStepId;
            const isCompleted = completedSteps.includes(step.id);
            const status: StepTabStatus = isActive
              ? 'active'
              : isCompleted
                ? 'completed'
                : 'inactive';

            return (
              <li key={step.id} className="flex-1 min-w-[56px]">
                <button
                  data-active={isActive ? 'true' : 'false'}
                  onClick={() => onSelectStep(step.id)}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`Шаг ${index + 1}: ${STEP_TYPE_LABEL[step.type]}${
                    isCompleted ? ', сдан' : ''
                  }`}
                  title={`${index + 1}. ${step.title}`}
                  className={[
                    'relative w-full flex flex-col items-center justify-center gap-0.5',
                    'py-2.5 px-2 min-h-[48px] select-none',
                    'transition-all duration-150 active:scale-95',
                    isActive
                      ? 'text-[#0593C6] dark:text-[#3BA8D8]'
                      : 'text-zinc-400 dark:text-zinc-500 opacity-60 hover:opacity-90',
                  ].join(' ')}
                >
                  {/* Индекс шага */}
                  <span
                    className={[
                      'text-[10px] font-semibold tabular-nums leading-none',
                      isActive
                        ? 'text-[#0593C6] dark:text-[#3BA8D8]'
                        : 'text-zinc-400 dark:text-zinc-600',
                    ].join(' ')}
                  >
                    {index + 1}
                  </span>

                  {/* Иконка типа шага + бейдж «сдано» */}
                  <span className="relative leading-none">
                    <StepIcon
                      type={step.type}
                      className={
                        isActive ? 'w-5 h-5' : 'w-5 h-5 opacity-80'
                      }
                    />
                    {status === 'completed' && (
                      <span className="absolute -right-2 -bottom-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0f172a] flex items-center justify-center">
                        <Check className="w-2 h-2 text-white" strokeWidth={3.5} />
                      </span>
                    )}
                  </span>

                  {/* Акцентная линия-индикатор под активным шагом (iOS tab) */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2.5px] w-8 sm:w-9 rounded-full bg-gradient-to-r from-[#0593C6] to-[#D83996]"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Тонкая нижняя граница-разделитель под лентой шагов */}
      <div className="h-px w-full bg-slate-200 dark:bg-slate-700/70" />
    </header>
  );
}
