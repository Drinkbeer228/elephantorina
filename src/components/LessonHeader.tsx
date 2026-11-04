import { useEffect, useRef } from 'react';
import { ChevronLeft, BookOpen, HelpCircle, FlaskConical, Layers, Check } from 'lucide-react';
import { Step, StepType } from '../types/course';

interface LessonHeaderProps {
  lessonTitle: string;
  lessonNumber?: string;
  steps: Step[];
  currentStepId: string;
  completedSteps: string[];
  onSelectStep: (stepId: string) => void;
  onBack: () => void;
  score?: number;
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

export default function LessonHeader({
  lessonTitle,
  lessonNumber,
  steps,
  currentStepId,
  completedSteps,
  onSelectStep,
  onBack,
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
    <div className="bg-white border-b border-[#E6E4DD]">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#2E5A44] hover:opacity-80 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>К списку уроков</span>
        </button>
        <div className="text-right truncate">
          <p className="text-xs font-semibold text-[#606462] uppercase tracking-wider truncate">
            {lessonNumber ? `Урок ${lessonNumber}` : 'Урок'}
          </p>
          <p className="text-sm font-bold text-[#1C1E1F] truncate">{lessonTitle}</p>
        </div>
      </div>

      {/* Step pins ribbon */}
      <nav
        ref={tabsRef}
        className="w-full overflow-x-auto no-scrollbar border-t border-[#E6E4DD] bg-[#F8F7F4]/50"
      >
        <div className="flex items-center max-w-3xl mx-auto px-4 min-w-max">
          {steps.map((step, index) => {
            const isActive = step.id === currentStepId;
            const isCompleted = completedSteps.includes(step.id);

            return (
              <button
                key={step.id}
                data-active={isActive ? 'true' : 'false'}
                onClick={() => onSelectStep(step.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-3 text-xs font-semibold transition-all
                  ${isActive
                    ? 'text-[#2E5A44] bg-white border-b-2 border-[#2E5A44] shadow-xs'
                    : isCompleted
                      ? 'text-[#1C1E1F] hover:bg-white/60'
                      : 'text-[#606462] hover:bg-white/40'
                  }
                `}
              >
                <span className="w-5 h-5 rounded-full bg-[#E6E4DD]/60 flex items-center justify-center text-[10px] font-bold">
                  {index + 1}
                </span>
                <StepIcon type={step.type} className="w-4 h-4" />
                <span className="max-w-[120px] truncate">{step.title}</span>
                {isCompleted && (
                  <Check className="w-3.5 h-3.5 text-[#2E5A44]" strokeWidth={3} />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
