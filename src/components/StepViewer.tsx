import { ChevronLeft, ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react';
import { Step } from '../types/course';
import TheoryStepComponent from './steps/TheoryStep';
import QuizStepComponent from './steps/QuizStep';
import FlashcardStepComponent from './steps/FlashcardStep';
import ScenarioStepComponent from './steps/ScenarioStep';

interface Props {
  step: Step;
  steps: Step[];
  currentIndex: number;
  completedSteps: string[];
  bookmarks: string[];
  quizAnswers: Record<string, number>;
  scenarioAnswers: Record<string, string>;
  onNavigate: (stepId: string) => void;
  onComplete: () => void;
  onQuizAnswer: (stepId: string, answerIndex: number) => void;
  onScenarioAnswer: (stepId: string, optionId: string) => void;
  onToggleBookmark: (stepId: string) => void;
}

export default function StepViewer({
  step,
  steps,
  currentIndex,
  completedSteps,
  bookmarks,
  quizAnswers,
  scenarioAnswers,
  onNavigate,
  onComplete,
  onQuizAnswer,
  onScenarioAnswer,
  onToggleBookmark
}: Props) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;
  const isCompleted = completedSteps.includes(step.id);
  const isBookmarked = bookmarks.includes(step.id);

  const handlePrev = () => {
    if (!isFirst) {
      onNavigate(steps[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (!isCompleted) {
      onComplete();
    }
    if (!isLast) {
      onNavigate(steps[currentIndex + 1].id);
    }
  };

  const renderStep = () => {
    switch (step.type) {
      case 'THEORY':
        return <TheoryStepComponent step={step} />;
      case 'QUIZ':
        return (
          <QuizStepComponent
            step={step}
            selectedAnswer={quizAnswers[step.id]}
            isCompleted={isCompleted}
            onAnswer={onQuizAnswer}
            onComplete={onComplete}
            onNext={handleNext}
          />
        );
      case 'FLASHCARD':
        return <FlashcardStepComponent step={step} />;
      case 'SCENARIO':
        return (
          <ScenarioStepComponent
            step={step}
            selectedOptionId={scenarioAnswers[step.id]}
            onSelectOption={onScenarioAnswer}
          />
        );
      default:
        return <div>Неизвестный тип степа</div>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Step content area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          {renderStep()}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="sticky bottom-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-700/50 px-4 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Back button */}
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
              transition-all duration-200
              ${isFirst
                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }
            `}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Назад</span>
          </button>

          {/* Center actions */}
          <div className="flex items-center gap-2">
            {/* Bookmark */}
            <button
              onClick={() => onToggleBookmark(step.id)}
              className={`
                p-2.5 rounded-xl transition-all duration-200
                ${isBookmarked
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }
              `}
              title={isBookmarked ? 'Убрать из закладок' : 'Добавить в закладки'}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-5 h-5" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>

            {/* Step counter */}
            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {currentIndex + 1} / {steps.length}
              </span>
            </div>
          </div>

          {/* Next / Complete button */}
          <button
            onClick={handleNext}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm
              transition-all duration-200 shadow-sm
              ${isLast && isCompleted
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }
            `}
          >
            <span>{isLast ? 'Завершить' : 'Вперёд'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
