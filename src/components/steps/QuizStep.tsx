import { useState } from 'react';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { QuizStep as QuizStepType } from '../../types/course';

interface Props {
  step: QuizStepType;
  selectedAnswer: string | undefined;
  onAnswer: (stepId: string, answerId: string) => void;
}

export default function QuizStep({ step, selectedAnswer, onAnswer }: Props) {
  const [showResult, setShowResult] = useState(!!selectedAnswer);

  const handleSelect = (optionId: string) => {
    if (showResult) return;
    onAnswer(step.id, optionId);
    setShowResult(true);
  };

  const selectedOption = step.options.find(o => o.id === selectedAnswer);
  const hasCorrectAnswer = step.options.some(o => o.isCorrect && o.id === selectedAnswer);

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
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Выберите все верные утверждения (кликайте по каждому)
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {step.options.map((option) => {
          const isSelected = option.id === selectedAnswer;
          const isCorrectOption = option.isCorrect;
          
          let optionStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20';
          
          if (showResult && isSelected) {
            optionStyle = isCorrectOption
              ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-700'
              : 'bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-500 ring-2 ring-red-200 dark:ring-red-700';
          } else if (showResult && isCorrectOption) {
            optionStyle = 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-600';
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={showResult}
              className={`
                w-full flex items-start gap-3 p-4 rounded-2xl border-2
                text-left transition-all duration-200
                ${optionStyle}
                ${!showResult ? 'cursor-pointer' : 'cursor-default'}
              `}
            >
              {/* Option indicator */}
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5
                ${showResult && isSelected && isCorrectOption
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : showResult && isSelected && !isCorrectOption
                    ? 'bg-red-500 border-red-500 text-white'
                    : showResult && isCorrectOption
                      ? 'border-emerald-400 dark:border-emerald-500'
                      : 'border-slate-300 dark:border-slate-600'
                }
              `}>
                {showResult && isSelected && isCorrectOption && <CheckCircle className="w-4 h-4" />}
                {showResult && isSelected && !isCorrectOption && <XCircle className="w-4 h-4" />}
                {!showResult && (
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                    {option.id.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Option text */}
              <span className={`text-sm leading-relaxed ${
                showResult && isSelected && !isCorrectOption
                  ? 'text-red-700 dark:text-red-300'
                  : showResult && (isSelected || isCorrectOption)
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-slate-700 dark:text-slate-200'
              }`}>
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Result & Explanation */}
      {showResult && (
        <div className={`
          p-4 rounded-2xl border-l-4 animate-in slide-in-from-bottom-2 duration-300
          ${hasCorrectAnswer
            ? 'bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-400'
            : 'bg-red-50/80 dark:bg-red-900/20 border-red-400'
          }
        `}>
          <div className="flex items-center gap-2 mb-2">
            {hasCorrectAnswer ? (
              <>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Верно!</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="font-semibold text-red-700 dark:text-red-300">Не совсем...</span>
              </>
            )}
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {step.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
