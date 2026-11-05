import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, ClipboardCheck, RotateCcw, ArrowRight } from 'lucide-react';
import { QuizStep as QuizStepType } from '../../types/course';
import { formatInlineHtml } from '../../utils/courseUtils';

interface Props {
  step: QuizStepType;
  selectedAnswer: number | undefined;
  isCompleted?: boolean;
  onAnswer: (stepId: string, answerIndex: number) => void;
  onComplete: () => void;
  onNext?: () => void;
}

export default function QuizStep({
  step,
  selectedAnswer,
  isCompleted,
  onAnswer,
  onComplete,
  onNext,
}: Props) {
  const hasAnswered = selectedAnswer !== undefined;
  const [justSubmitted, setJustSubmitted] = useState<boolean>(false);
  const [retrying, setRetrying] = useState<boolean>(false);

  const submitted = (Boolean(isCompleted) || justSubmitted) && !retrying;

  useEffect(() => {
    setJustSubmitted(false);
    setRetrying(false);
  }, [step.id]);

  const isCorrect = selectedAnswer === step.correctAnswer;

  const handleSelect = (index: number) => {
    if (submitted) return;
    onAnswer(step.id, index);
  };

  const handleSubmit = () => {
    if (!hasAnswered || submitted) return;
    setRetrying(false);
    setJustSubmitted(true);
    onComplete();
  };

  const handleRetry = () => {
    setJustSubmitted(false);
    setRetrying(true);
  };

  // Resolve wrongExplanation safely: in coursesData, wrongExplanation has 3 entries for the 3 wrong options
  const getWrongFeedback = (selectedIdx: number | undefined): string | null => {
    if (selectedIdx === undefined || selectedIdx === step.correctAnswer || !step.wrongExplanation) {
      return null;
    }
    if (step.wrongExplanation.length === step.options.length) {
      return step.wrongExplanation[selectedIdx] || null;
    }
    // Map index among non-correct options
    const wrongIndices = step.options
      .map((_, i) => i)
      .filter((i) => i !== step.correctAnswer);
    const pos = wrongIndices.indexOf(selectedIdx);
    return pos >= 0 ? step.wrongExplanation[pos] || null : step.wrongExplanation[0] || null;
  };

  const specificWrongFeedback = getWrongFeedback(selectedAnswer);

  return (
    <section className="animate-in bg-white border border-[#E4DFD3] rounded-2xl p-6 sm:p-10 space-y-6">
      {/* Header */}
      <header className="pb-5 border-b border-[#E4DFD3]">
        <div className="flex items-center gap-2 text-xs font-medium text-[#5C615D] mb-2">
          <span>Контроль усвоения материала</span>
          <span aria-hidden="true">·</span>
          <span>Академическое тестирование</span>
        </div>
        <h1
          className="font-display text-2xl sm:text-3xl font-bold text-[#181A18] tracking-tight"
          style={{ textWrap: 'balance' }}
        >
          {step.title}
        </h1>
      </header>

      {/* Question Card */}
      <div className="p-5 sm:p-6 bg-[#FBF9F5] rounded-xl border border-[#E4DFD3]">
        <p
          className="text-base sm:text-lg font-semibold text-[#181A18] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatInlineHtml(step.question) }}
        />
      </div>

      {/* Options */}
      <div className="space-y-3" role="radiogroup" aria-label={step.title}>
        {step.options.map((option, index) => {
          const isSelected = index === selectedAnswer;
          const isCorrectOption = index === step.correctAnswer;
          const letter = String.fromCharCode(65 + index);

          let cardClass =
            'bg-white border-[#E4DFD3] hover:border-[#1E4631]/60 hover:bg-[#FBF9F5]';
          let badgeClass = 'bg-[#F3EFE6] border-[#D8D2C2] text-[#5C615D]';
          let textClass = 'text-[#181A18]';

          if (submitted && isSelected) {
            if (isCorrectOption) {
              cardClass = 'bg-[#F2F7F4] border-[#1E4631]';
              badgeClass = 'bg-[#1E4631] border-[#1E4631] text-white';
              textClass = 'text-[#143322] font-medium';
            } else {
              cardClass = 'bg-[#FDF4F3] border-[#9E2A2B]';
              badgeClass = 'bg-[#9E2A2B] border-[#9E2A2B] text-white';
              textClass = 'text-[#6E1B1C] font-medium';
            }
          } else if (submitted && isCorrectOption) {
            cardClass = 'bg-[#F2F7F4]/70 border-[#1E4631]/60';
            badgeClass = 'bg-[#E3EFE8] border-[#1E4631] text-[#1E4631]';
            textClass = 'text-[#143322]';
          } else if (isSelected) {
            cardClass = 'bg-[#F3EFE6]/80 border-[#1E4631] ring-1 ring-[#1E4631]/30';
            badgeClass = 'bg-[#1E4631] border-[#1E4631] text-white';
            textClass = 'text-[#181A18] font-medium';
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(index)}
              disabled={submitted}
              className={`w-full flex items-start gap-4 p-4 sm:p-5 rounded-xl border text-left transition-colors ${cardClass} ${
                !submitted ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 font-mono-code text-xs font-bold mt-0.5 ${badgeClass}`}
              >
                {submitted && isSelected && isCorrectOption ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : submitted && isSelected && !isCorrectOption ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  letter
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span
                  className={`block text-sm sm:text-[15px] leading-relaxed ${textClass}`}
                  dangerouslySetInnerHTML={{ __html: formatInlineHtml(option) }}
                />
                {submitted && isCorrectOption && (
                  <span className="inline-block mt-1.5 text-xs font-semibold text-[#1E4631]">
                    ✓ Эталонный научный ответ
                  </span>
                )}
                {submitted && isSelected && !isCorrectOption && (
                  <span className="inline-block mt-1.5 text-xs font-semibold text-[#9E2A2B]">
                    ✕ Выбранный ответ содержит ошибку
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Submit Action */}
      {!submitted && (
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!hasAnswered}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-colors ${
              hasAnswered
                ? 'bg-[#1E4631] hover:bg-[#153423] text-white cursor-pointer'
                : 'bg-[#F3EFE6] text-[#7A7F7A] border border-[#E4DFD3] cursor-not-allowed'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Проверить ответ</span>
          </button>
          {!hasAnswered && (
            <p className="mt-2 text-center text-xs text-[#5C615D]">
              Выберите один из вариантов ответа выше для проверки
            </p>
          )}
        </div>
      )}

      {/* Results & Scientific Explanation */}
      {submitted && (
        <div
          className={`p-5 sm:p-6 rounded-xl border space-y-4 animate-in ${
            isCorrect
              ? 'bg-[#F4F8F5] border-[#B8D1C1]'
              : 'bg-[#FDF6F5] border-[#E4BDBC]'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-black/10">
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-[#1E4631]" />
                  <span className="font-bold text-sm uppercase tracking-wider text-[#1E4631]">
                    Ответ подтвержден · +10 академических баллов
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-[#9E2A2B]" />
                  <span className="font-bold text-sm uppercase tracking-wider text-[#9E2A2B]">
                    Требуется коррекция · Разбор клинико-научной ошибки
                  </span>
                </>
              )}
            </div>
            <span className="font-mono-code text-xs font-semibold text-[#5C615D]">
              Точность: {isCorrect ? '100%' : '0%'}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5C615D]">
              Научное обоснование:
            </p>
            <p
              className="text-sm sm:text-[15px] text-[#181A18] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatInlineHtml(step.explanation) }}
            />
          </div>

          {!isCorrect && specificWrongFeedback && (
            <div className="p-4 rounded-lg bg-white/80 border border-[#E4BDBC] space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[#9E2A2B]">
                Почему вариант {String.fromCharCode(65 + (selectedAnswer ?? 0))} неверен:
              </p>
              <p
                className="text-sm text-[#4A1C1D] leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: formatInlineHtml(specificWrongFeedback),
                }}
              />
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {onNext && (
              <button
                type="button"
                onClick={onNext}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white bg-[#1E4631] hover:bg-[#153423] transition-colors cursor-pointer"
              >
                <span>Перейти к следующему шагу</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-white border border-[#D8D2C2] text-[#181A18] hover:bg-[#F3EFE6] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Пройти заново</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
