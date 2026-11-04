import { useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react';
import { Step } from '../types/course';
import TheoryStepComponent from './steps/TheoryStep';
import QuizStepComponent from './steps/QuizStep';
import FlashcardStepComponent from './steps/FlashcardStep';
import ScenarioStepComponent from './steps/ScenarioStep';
import confetti from 'canvas-confetti';

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

  const handlePrev = useCallback(() => {
    if (!isFirst) {
      onNavigate(steps[currentIndex - 1].id);
    }
  }, [isFirst, currentIndex, steps, onNavigate]);

  const handleNext = useCallback(() => {
    if (!isCompleted) {
      onComplete();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    }
    if (!isLast) {
      onNavigate(steps[currentIndex + 1].id);
    } else {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
    }
  }, [isCompleted, isLast, onComplete, onNavigate, steps, currentIndex]);

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

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
            onComplete={() => {
              onComplete();
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }}
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
    <div className="flex flex-col min-h-[calc(100vh-130px)] pb-20">
      {/* Content area */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          {renderStep()}
        </div>
      </div>

      {/* Bottom navigation bar */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-[#E6E4DD] px-4 sm:px-6 py-3.5 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors
              ${isFirst
                ? 'text-[#606462]/40 bg-[#F8F7F4] cursor-not-allowed'
                : 'text-[#1C1E1F] bg-[#F8F7F4] hover:bg-[#E6E4DD]/50'
              }
            `}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Предыдущий шаг</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleBookmark(step.id)}
              className={`p-2.5 rounded-xl border transition-colors ${
                isBookmarked
                  ? 'bg-[#C86D51]/10 border-[#C86D51] text-[#C86D51]'
                  : 'bg-[#F8F7F4] border-[#E6E4DD] text-[#606462] hover:bg-[#E6E4DD]/50'
              }`}
              title={isBookmarked ? 'В закладках' : 'Добавить в закладки'}
            >
              {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </button>
            <span className="text-xs font-semibold text-[#606462]">
              {currentIndex + 1} из {steps.length}
            </span>
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#2E5A44] hover:bg-[#244936] text-white shadow-xs transition-all"
          >
            <span>{isLast ? 'Завершить урок' : 'Следующий шаг'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
