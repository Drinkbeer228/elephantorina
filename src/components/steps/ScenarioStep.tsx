import { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, RotateCcw, Stethoscope } from 'lucide-react';
import { ScenarioStep as ScenarioStepType } from '../../types/course';

interface Props {
  step: ScenarioStepType;
  selectedOptionId: string | undefined;
  onSelectOption: (stepId: string, optionId: string) => void;
}

export default function ScenarioStep({ step, selectedOptionId, onSelectOption }: Props) {
  const [localSelection, setLocalSelection] = useState<string | undefined>(selectedOptionId);

  const handleSelect = (optionId: string) => {
    setLocalSelection(optionId);
    onSelectOption(step.id, optionId);
  };

  const handleRetry = () => {
    setLocalSelection(undefined);
  };

  const selectedOption = step.options.find(o => o.id === localSelection);
  const isCorrect = selectedOption?.isCorrect;
  const hasAnswered = localSelection !== undefined;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
            {step.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Клинический симулятор</p>
        </div>
      </div>

      {/* Patient Card */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/50 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center text-4xl shadow-inner">
            {step.patientInfo.avatarEmoji || '🐘'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {step.patientInfo.name}
              </h3>
              <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                {step.patientInfo.age} лет
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {step.patientInfo.role}
            </p>
          </div>
        </div>
      </div>

      {/* Situation Block */}
      <div className="bg-amber-50/80 dark:bg-amber-900/20 backdrop-blur-xl border border-amber-200/80 dark:border-amber-700/50 rounded-3xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
              ⚠️ Клиническая ситуация
            </p>
            <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
              {step.situation}
            </p>
          </div>
        </div>
      </div>

      {/* Action Prompt */}
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Ваши действия?
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {step.options.map((option) => {
          const isSelected = option.id === localSelection;
          const isCorrectOption = option.isCorrect;

          let optionStyle = 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 hover:shadow-md';

          if (hasAnswered) {
            if (isSelected && isCorrectOption) {
              optionStyle = 'bg-emerald-50/80 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-700 shadow-md';
            } else if (isSelected && !isCorrectOption) {
              optionStyle = 'bg-red-50/80 dark:bg-red-900/30 border-red-400 dark:border-red-500 ring-2 ring-red-200 dark:ring-red-700 shadow-md';
            } else {
              optionStyle = 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-50';
            }
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={hasAnswered}
              className={`
                w-full flex items-start gap-4 p-4 rounded-2xl border-2
                text-left transition-all duration-200 min-h-[54px]
                ${optionStyle}
                ${!hasAnswered ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'}
              `}
            >
              {/* Option indicator */}
              <div className={`
                w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0
                ${hasAnswered && isSelected && isCorrectOption
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : hasAnswered && isSelected && !isCorrectOption
                    ? 'bg-red-500 border-red-500 text-white'
                    : hasAnswered && isCorrectOption
                      ? 'border-emerald-400 dark:border-emerald-500'
                      : 'border-slate-300 dark:border-slate-600'
                }
              `}>
                {hasAnswered && isSelected && isCorrectOption && <CheckCircle2 className="w-5 h-5" />}
                {hasAnswered && isSelected && !isCorrectOption && <XCircle className="w-5 h-5" />}
                {!hasAnswered && (
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                    {option.id.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Option text */}
              <span className={`text-sm leading-relaxed pt-1 ${
                hasAnswered && isSelected && !isCorrectOption
                  ? 'text-red-700 dark:text-red-300'
                  : hasAnswered && (isSelected || isCorrectOption)
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-slate-700 dark:text-slate-200'
              }`}>
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {hasAnswered && selectedOption && (
        <div className={`
          rounded-3xl border-l-4 p-5 animate-in slide-in-from-bottom-2 duration-300
          ${isCorrect
            ? 'bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-500'
            : 'bg-red-50/80 dark:bg-red-900/20 border-red-400 dark:border-red-500'
          }
        `}>
          <div className="flex items-start gap-3">
            {isCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500 shrink-0" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${
                isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {isCorrect ? '🟢 КЛИНИЧЕСКИ ВЕРНО' : '🔴 ОПАСНОЕ РЕШЕНИЕ'}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedOption.feedback}
              </p>
              {!isCorrect && (
                <button
                  onClick={handleRetry}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Попробовать другое решение
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
