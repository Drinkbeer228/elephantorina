import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, HelpCircle, ClipboardCheck, RotateCcw } from 'lucide-react';
import { QuizStep as QuizStepType } from '../../types/course';

interface Props {
  step: QuizStepType;
  selectedAnswer: number | undefined;
  isCompleted?: boolean;
  onAnswer: (stepId: string, answerIndex: number) => void;
  /** Сохранение прогресса шага (onComplete -> запись в localStorage в App) */
  onComplete: () => void;
  /** Переход к следующему шагу */
  onNext?: () => void;
}

export default function QuizStep({ step, selectedAnswer, isCompleted, onAnswer, onComplete, onNext }: Props) {
  const hasAnswered = selectedAnswer !== undefined;
  // ЕДИНСТВЕННЫЙ источник истины для режима результатов: шаг сдан ли нет.
  // Локальный флаг нужен только для мгновенного отклика до записи в стор.
  const [justSubmitted, setJustSubmitted] = useState<boolean>(false);
  const submitted = Boolean(isCompleted) || justSubmitted;

  // Сброс локального флага при переходе между шагами (компонент не размонтируется)
  useEffect(() => {
    setJustSubmitted(false);
  }, [step.id]);

  const isCorrect = selectedAnswer === step.correctAnswer;
  const scorePercent = hasAnswered ? (isCorrect ? 100 : 0) : 0;

  const handleSelect = (index: number) => {
    if (submitted) return;
    onAnswer(step.id, index);
  };

  // Обработчик кнопки «Завершить тест»: без async-ловушек и preventDefault —
  // синхронно считает результат, сохраняет прогресс и включает экран разбора.
  const handleSubmit = () => {
    if (!hasAnswered || submitted) return;
    setJustSubmitted(true);
    onComplete(); // completedSteps / score -> localStorage
  };

  const handleRetry = () => {
    setJustSubmitted(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
            {step.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Проверь свои знания</p>
        </div>
      </div>

      {/* Question */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
        <p className="text-lg font-medium text-slate-800 dark:text-slate-100">
          {step.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {step.options.map((option, index) => {
          const isSelected = index === selectedAnswer;
          const isCorrectOption = index === step.correctAnswer;

          let optionStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20';

          if (submitted && isSelected) {
            optionStyle = isCorrectOption
              ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-700'
              : 'bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-500 ring-2 ring-red-200 dark:ring-red-700';
          } else if (submitted && isCorrectOption) {
            optionStyle = 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-600';
          } else if (isSelected) {
            // Выбранный, но ещё не отправленный вариант — подсветка перед проверкой
            optionStyle = 'bg-[#0593C6]/5 dark:bg-[#0593C6]/15 border-[#0593C6] dark:border-[#3BA8D8] ring-2 ring-[#0593C6]/20 dark:ring-[#3BA8D8]/25';
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(index)}
              disabled={submitted}
              className={`
                w-full flex items-start gap-3 p-4 rounded-2xl border-2
                text-left transition-all duration-200
                ${optionStyle}
                ${!submitted ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'}
              `}
            >
              {/* Option indicator */}
              <div className={`
                w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0
                ${submitted && isSelected && isCorrectOption
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : submitted && isSelected && !isCorrectOption
                    ? 'bg-red-500 border-red-500 text-white'
                    : submitted && isCorrectOption
                      ? 'border-emerald-400 dark:border-emerald-500'
                      : isSelected
                        ? 'border-[#0593C6] bg-[#0593C6] text-white'
                        : 'border-slate-300 dark:border-slate-600'
                }
              `}>
                {submitted && isSelected && isCorrectOption && <CheckCircle className="w-4 h-4" />}
                {submitted && isSelected && !isCorrectOption && <XCircle className="w-4 h-4" />}
                {!submitted && (
                  <span className={`text-xs font-bold ${isSelected ? '' : 'text-slate-400 dark:text-slate-500'}`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                )}
              </div>

              {/* Option text */}
              <span className={`text-sm leading-relaxed pt-0.5 ${
                submitted && isSelected && !isCorrectOption
                  ? 'text-red-700 dark:text-red-300'
                  : submitted && (isSelected || isCorrectOption)
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-slate-700 dark:text-slate-200'
              }`}>
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Submit zone — кнопка активна, если выбран хотя бы один вариант */}
      {!submitted && (
        <div className="pt-1">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!hasAnswered}
            title={hasAnswered ? 'Подсчитать результат и открыть разбор' : 'Сначала выберите один вариант ответа'}
            className={`
              w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl
              font-semibold text-sm transition-all duration-200
              ${hasAnswered
                ? 'bg-gradient-to-r from-[#0593C6] to-[#D83996] text-white shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.99] cursor-pointer'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'}
            `}
          >
            <ClipboardCheck className="w-5 h-5" />
            Завершить тест
          </button>
          {!hasAnswered && (
            <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">
              Выберите вариант ответа выше, чтобы кнопка стала активной
            </p>
          )}
        </div>
      )}

      {/* Экран результатов: баллы, разбор ошибок, переход к следующему шагу */}
      {submitted && (
        <div className={`
          p-4 rounded-2xl border-l-4 animate-in slide-in-from-bottom-2 duration-300
          ${isCorrect
            ? 'bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-400'
            : 'bg-red-50/80 dark:bg-red-900/20 border-red-400'
          }
        `}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">Верно! 🎉</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="font-semibold text-red-700 dark:text-red-300">Неверно</span>
                </>
              )}
            </div>
            {/* Баллы за шаг */}
            <span className={`
              px-2.5 py-1 rounded-full text-xs font-bold
              ${isCorrect
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}
            `}>
              {scorePercent}% · {isCorrect ? '+10' : '+0'} баллов
            </span>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {step.explanation}
          </p>

          {/* Разбор выбранного неправильного ответа */}
          {!isCorrect && step.wrongExplanation && step.wrongExplanation[selectedAnswer!] && (
            <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
                Почему вариант {String.fromCharCode(65 + selectedAnswer!)} ошибочен:
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                {step.wrongExplanation[selectedAnswer!]}
              </p>
            </div>
          )}

          {/* Действия: следующий шаг / пересдача */}
          <div className="mt-4 flex items-center gap-2">
            {onNext && (
              <button
                type="button"
                onClick={onNext}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                  font-semibold text-sm text-white transition-all duration-200
                  ${isCorrect
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : 'bg-gradient-to-r from-[#0593C6] to-[#D83996] hover:brightness-105'}
                `}
              >
                {isCorrect ? 'Ответ засчитан — следующий шаг' : 'Перейти к следующему шагу'}
              </button>
            )}
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Пересдать
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
