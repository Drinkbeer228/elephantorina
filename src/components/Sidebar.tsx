import { ChevronRight, BookOpen, Brain, Layers } from 'lucide-react';
import { Step, StepType } from '../types/course';

interface SidebarProps {
  steps: Step[];
  currentStepId: string;
  completedSteps: string[];
  onSelectStep: (stepId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

function getStepIcon(type: StepType) {
  switch (type) {
    case 'THEORY':
      return <BookOpen className="w-4 h-4" />;
    case 'QUIZ':
      return <Brain className="w-4 h-4" />;
    case 'FLASHCARD':
      return <Layers className="w-4 h-4" />;
    default:
      return <BookOpen className="w-4 h-4" />;
  }
}

function getStepLabel(type: StepType) {
  switch (type) {
    case 'THEORY':
      return 'Теория';
    case 'QUIZ':
      return 'Тест';
    case 'FLASHCARD':
      return 'Карточки';
    default:
      return 'Степ';
  }
}

export default function Sidebar({
  steps,
  currentStepId,
  completedSteps,
  onSelectStep,
  isOpen,
  onClose
}: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 lg:top-[65px] left-0 z-40 lg:z-10
          h-full lg:h-[calc(100vh - 65px)]
          w-72 lg:w-72
          bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl
          border-r border-slate-200/80 dark:border-slate-700/50
          shadow-xl lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
        `}
      >
        <div className="p-4">
          {/* Module header */}
          <div className="mb-4 px-2">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Модуль 1
            </h2>
            <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
              🦴 Уникальная анатомия
            </p>
          </div>

          {/* Steps list */}
          <nav className="space-y-1">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStepId === step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    onSelectStep(step.id);
                    onClose();
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-2xl
                    text-left transition-all duration-200
                    ${isCurrent
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-300 dark:border-indigo-600 shadow-sm'
                      : isCompleted
                        ? 'bg-emerald-50/50 dark:bg-emerald-900/20 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }
                  `}
                >
                  {/* Status indicator */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center shrink-0
                    ${isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }
                  `}>
                    {isCompleted ? (
                      <span className="text-sm">✓</span>
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </div>

                  {/* Step info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      isCurrent
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : isCompleted
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-slate-700 dark:text-slate-200'
                    }`}>
                      {step.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`
                        inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md
                        ${isCurrent
                          ? 'bg-indigo-100 dark:bg-indigo-800/50 text-indigo-600 dark:text-indigo-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }
                      `}>
                        {getStepIcon(step.type)}
                        {getStepLabel(step.type)}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  {isCurrent && (
                    <ChevronRight className="w-4 h-4 text-indigo-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Progress summary */}
          <div className="mt-6 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Прогресс модуля</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {completedSteps.length}/{steps.length}
              </span>
            </div>
            <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
