import { useEffect, useRef } from 'react';
import {
  ChevronLeft,
  BookOpen,
  HelpCircle,
  FlaskConical,
  Layers,
  Check,
  PanelLeft,
} from 'lucide-react';
import { Step, StepType } from '../types/course';

interface LessonHeaderProps {
  courseTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  lessonNumber?: string;
  steps: Step[];
  currentStepId: string;
  completedSteps: string[];
  onSelectStep: (stepId: string) => void;
  onBack: () => void;
  onToggleSidebar?: () => void;
}

function StepIcon({ type, className }: { type: StepType; className?: string }) {
  switch (type) {
    case 'THEORY':
      return <BookOpen className={className} />;
    case 'QUIZ':
      return <HelpCircle className={className} />;
    case 'SCENARIO':
      return <FlaskConical className={className} />;
    case 'FLASHCARD':
      return <Layers className={className} />;
    default:
      return <BookOpen className={className} />;
  }
}

const STEP_TYPE_LABEL: Record<StepType, string> = {
  THEORY: 'Теория',
  QUIZ: 'Тест',
  FLASHCARD: 'Глоссарий',
  SCENARIO: 'Симулятор',
};

export default function LessonHeader({
  moduleTitle,
  lessonTitle,
  lessonNumber,
  steps,
  currentStepId,
  completedSteps,
  onSelectStep,
  onBack,
  onToggleSidebar,
}: LessonHeaderProps) {
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;
    const active = container.querySelector<HTMLElement>('[data-active="true"]');
    if (!active) return;
    const target = active.offsetLeft - container.clientWidth / 2 + active.clientWidth / 2;
    container.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [currentStepId]);

  return (
    <div className="bg-white border-b border-[#E4DFD3]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3EFE6] hover:bg-[#E4DFD3] text-xs font-semibold text-[#181A18] transition-colors cursor-pointer shrink-0"
              aria-label="Открыть оглавление курса"
            >
              <PanelLeft className="w-4 h-4 text-[#1E4631]" />
              <span>Оглавление</span>
            </button>
          )}
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1E4631] hover:underline transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Все треки</span>
          </button>
          <span aria-hidden="true" className="text-[#D8D2C2] hidden sm:inline">
            /
          </span>
          <span className="text-xs text-[#5C615D] truncate hidden sm:inline max-w-[280px]">
            {moduleTitle}
          </span>
        </div>

        <div className="text-left sm:text-right min-w-0 flex-1 sm:flex-initial">
          <div className="flex items-center sm:justify-end gap-2 text-xs text-[#5C615D]">
            <span>{lessonNumber ? `Урок ${lessonNumber}` : 'Урок'}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{steps.length} шагов в уроке</span>
          </div>
          <p className="font-display text-lg sm:text-xl font-bold text-[#181A18] truncate mt-0.5">
            {lessonTitle}
          </p>
        </div>
      </div>

      {/* Current Lesson Step Tabs */}
      <nav
        ref={tabsRef}
        aria-label="Шаги текущего урока"
        className="w-full overflow-x-auto no-scrollbar border-t border-[#E4DFD3] bg-[#FBF9F5]"
      >
        <div className="flex items-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 min-w-max">
          {steps.map((step, index) => {
            const isActive = step.id === currentStepId;
            const isCompleted = completedSteps.includes(step.id);

            return (
              <button
                key={step.id}
                type="button"
                data-active={isActive ? 'true' : 'false'}
                onClick={() => onSelectStep(step.id)}
                className={`relative flex items-center gap-2.5 px-4 py-3 text-xs font-semibold transition-colors border-b-2 whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-[#1E4631] bg-white border-[#1E4631]'
                    : isCompleted
                      ? 'text-[#181A18] border-transparent hover:bg-white/70'
                      : 'text-[#5C615D] border-transparent hover:bg-white/50'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded text-[11px] font-mono-code font-bold flex items-center justify-center shrink-0 ${
                    isCompleted
                      ? 'bg-[#1E4631] text-white'
                      : isActive
                        ? 'bg-[#F3EFE6] text-[#1E4631] border border-[#1E4631]/40'
                        : 'bg-[#EAE4D6] text-[#5C615D]'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3" strokeWidth={3} /> : index + 1}
                </span>
                <StepIcon type={step.type} className="w-3.5 h-3.5 shrink-0" />
                <span>{STEP_TYPE_LABEL[step.type]}</span>
                <span aria-hidden="true" className="text-[#C8C2B2]">
                  ·
                </span>
                <span className="max-w-[160px] truncate font-normal">
                  {step.title.replace(/^\d+\.\s*/, '')}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
