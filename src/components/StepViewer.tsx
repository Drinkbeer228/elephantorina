import { useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, CheckCircle2 } from 'lucide-react';
import { Step } from '../types/course';
import TheoryStepComponent from './steps/TheoryStep';
import QuizStepComponent from './steps/QuizStep';
import FlashcardStepComponent from './steps/FlashcardStep';
import ScenarioStepComponent from './steps/ScenarioStep';
import confetti from 'canvas-confetti';

interface Props {
  step: Step;
  courseSteps: Step[];
  courseStepIndex: number;
  lessonSteps: Step[];
  lessonStepIndex: number;
  completedSteps: string[];
  bookmarks: string[];
  quizAnswers: Record<string, number>;
  scenarioAnswers: Record<string, string>;
  onNavigate: (stepId: string) => void;
  onComplete: () => void;
  onQuizAnswer: (stepId: string, answerIndex: number) => void;
  onScenarioAnswer: (stepId: string, optionId: string) => void;
  onToggleBookmark: (stepId: string) => void;
  onFinishCourse?: () => void;
}

export default function StepViewer({
  step,
  courseSteps,
  courseStepIndex,
  lessonSteps,
  lessonStepIndex,
  completedSteps,
  bookmarks,
  quizAnswers,
  scenarioAnswers,
  onNavigate,
  onComplete,
  onQuizAnswer,
  onScenarioAnswer,
  onToggleBookmark,
  onFinishCourse,
}: Props) {
  const isFirstInCourse = courseStepIndex === 0;
  const isLastInCourse = courseStepIndex === courseSteps.length - 1;
  const isLastInLesson = lessonStepIndex === lessonSteps.length - 1;
  const isCompleted = completedSteps.includes(step.id);
  const isBookmarked = bookmarks.includes(step.id);

  const handlePrev = useCallback(() => {
    if (!isFirstInCourse) {
      onNavigate(courseSteps[courseStepIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isFirstInCourse, courseStepIndex, courseSteps, onNavigate]);

  const handleNext = useCallback(() => {
    if (!isCompleted) {
      onComplete();
      try {
        confetti({ particleCount: 35, spread: 55, origin: { y: 0.85 } });
      } catch {
        // Ignore confetti errors in headless browsers
      }
    }
    if (!isLastInCourse) {
      onNavigate(courseSteps[courseStepIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (onFinishCourse) {
      try {
        confetti({ particleCount: 100, spread: 90, origin: { y: 0.6 } });
      } catch {
        // Ignore confetti errors
      }
      onFinishCourse();
    }
  }, [
    isCompleted,
    isLastInCourse,
    onComplete,
    onNavigate,
    courseSteps,
    courseStepIndex,
    onFinishCourse,
  ]);

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
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
              try {
                confetti({ particleCount: 60, spread: 65, origin: { y: 0.7 } });
              } catch {
                // Ignore in headless environment
              }
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
            onComplete={onComplete}
          />
        );
      default:
        return <div>Неизвестный тип учебного материала</div>;
    }
  };

  return (
    <div className="flex flex-col flex-1 justify-between">
      {/* Main Content Container */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Top Utility Strip inside Reader */}
          <div className="flex items-center justify-between gap-4 text-xs text-[#5C615D] px-1">
            <div className="flex items-center gap-2 tabular-nums">
              <span>
                Шаг урока {lessonStepIndex + 1} из {lessonSteps.length}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Общий шаг трека {courseStepIndex + 1} из {courseSteps.length}
              </span>
              {isCompleted && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#1E4631]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Изучено
                  </span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => onToggleBookmark(step.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                isBookmarked
                  ? 'bg-[#F9F4EE] border-[#9A4B26] text-[#9A4B26]'
                  : 'bg-white border-[#D8D2C2] text-[#5C615D] hover:text-[#181A18] hover:bg-[#F3EFE6]'
              }`}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>В закладках</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Сохранить в закладки</span>
                </>
              )}
            </button>
          </div>

          {renderStep()}
        </div>
      </div>

      {/* Bottom Monograph Navigation Bar */}
      <div className="sticky bottom-0 bg-[#FBF9F5]/95 backdrop-blur-md border-t border-[#E4DFD3] px-4 sm:px-6 lg:px-8 py-3.5 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={isFirstInCourse}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs sm:text-sm border transition-colors whitespace-nowrap shrink-0 ${
              isFirstInCourse
                ? 'text-[#7A7F7A]/50 bg-[#F3EFE6]/50 border-[#E4DFD3] cursor-not-allowed'
                : 'text-[#181A18] bg-white border-[#D8D2C2] hover:bg-[#F3EFE6] cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Предыдущий шаг</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#5C615D] tabular-nums">
            <span>Клавиши навигации:</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-[#D8D2C2] rounded font-mono-code text-[11px]">
              ←
            </kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-[#D8D2C2] rounded font-mono-code text-[11px]">
              →
            </kbd>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-xs sm:text-sm bg-[#1E4631] hover:bg-[#153423] text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>
              {isLastInCourse
                ? 'Завершить трек'
                : isLastInLesson
                  ? 'К следующему модулю'
                  : 'Следующий шаг'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
