import { ChevronRight, BookOpen, Brain, Layers } from 'lucide-react';
import { Step, StepType, Course } from '../types/course';

interface SidebarProps {
  course: Course;
  allSteps: Step[];
  currentStepId: string;
  completedSteps: string[];
  onSelectStep: (stepId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

function getStepIcon(type: StepType) {
  switch (type) {
    case 'THEORY':
      return <BookOpen className="w-3.5 h-3.5" />;
    case 'QUIZ':
      return <Brain className="w-3.5 h-3.5" />;
    case 'FLASHCARD':
      return <Layers className="w-3.5 h-3.5" />;
    default:
      return <BookOpen className="w-3.5 h-3.5" />;
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
  course,
  allSteps,
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
          {/* Modules list */}
          {course.modules.map((module) => (
            <div key={module.id} className="mb-6">
              {/* Module header */}
              <div className="mb-3 px-2">
                <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {module.title}
                </h2>
              </div>

              {/* Lessons within module */}
              {module.lessons.map((lesson) => (
                <div key={lesson.id} className="mb-2">
                  <p className="px-2 py-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                    {lesson.title}
                  </p>

                  {/* Steps within lesson */}
                  <nav className="space-y-1 mt-1">
                    {lesson.steps.map((step) => {
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
                            w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                            text-left transition-all duration-200
                            ${isCurrent
                              ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 shadow-sm'
                              : isCompleted
                                ? 'bg-emerald-50/50 dark:bg-emerald-900/20 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }
                          `}
                        >
                          {/* Status indicator */}
                          <div className={`
                            w-7 h-7 rounded-full flex items-center justify-center shrink-0
                            ${isCompleted
                              ? 'bg-emerald-500 text-white'
                              : isCurrent
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                            }
                          `}>
                            {isCompleted ? (
                              <span className="text-xs">✓</span>
                            ) : (
                              getStepIcon(step.type)
                            )}
                          </div>

                          {/* Step info */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${
                              isCurrent
                                ? 'text-indigo-700 dark:text-indigo-300'
                                : isCompleted
                                  ? 'text-emerald-700 dark:text-emerald-300'
                                  : 'text-slate-700 dark:text-slate-200'
                            }`}>
                              {step.title}
                            </p>
                            <span className={`
                              inline-block text-[10px] px-1.5 py-0.5 rounded mt-0.5
                              ${isCurrent
                                ? 'bg-indigo-100 dark:bg-indigo-800/50 text-indigo-600 dark:text-indigo-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                              }
                            `}>
                              {getStepLabel(step.type)}
                            </span>
                          </div>

                          {/* Arrow */}
                          {isCurrent && (
                            <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>
          ))}

          {/* Progress summary */}
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Общий прогресс</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {completedSteps.length}/{allSteps.length}
              </span>
            </div>
            <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(completedSteps.length / allSteps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
