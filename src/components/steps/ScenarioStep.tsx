import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, RotateCcw, Stethoscope } from 'lucide-react';
import { ScenarioStep as ScenarioStepType } from '../../types/course';
import { formatInlineHtml } from '../../utils/courseUtils';

interface Props {
  step: ScenarioStepType;
  selectedOptionId: string | undefined;
  onSelectOption: (stepId: string, optionId: string) => void;
  onComplete?: () => void;
}

export default function ScenarioStep({
  step,
  selectedOptionId,
  onSelectOption,
  onComplete,
}: Props) {
  const [localSelection, setLocalSelection] = useState<string | undefined>(selectedOptionId);

  useEffect(() => {
    setLocalSelection(selectedOptionId);
  }, [selectedOptionId, step.id]);

  const handleSelect = (optionId: string) => {
    setLocalSelection(optionId);
    onSelectOption(step.id, optionId);
    const chosen = step.options.find((o) => o.id === optionId);
    if (chosen?.isCorrect && onComplete) {
      onComplete();
    }
  };

  const handleRetry = () => {
    setLocalSelection(undefined);
  };

  const selectedOption = step.options.find((o) => o.id === localSelection);
  const isCorrect = selectedOption?.isCorrect;
  const hasAnswered = localSelection !== undefined;

  return (
    <section className="animate-in bg-white border border-[#E4DFD3] rounded-2xl p-6 sm:p-10 space-y-6">
      {/* Header */}
      <header className="pb-5 border-b border-[#E4DFD3]">
        <div className="flex items-center gap-2 text-xs font-medium text-[#9A4B26] mb-2">
          <Stethoscope className="w-4 h-4" />
          <span>Клинико-экологический симулятор принятия решений</span>
        </div>
        <h1
          className="font-display text-2xl sm:text-3xl font-bold text-[#181A18] tracking-tight"
          style={{ textWrap: 'balance' }}
        >
          {step.title}
        </h1>
      </header>

      {/* Patient / Subject Dossier */}
      <div className="bg-[#FBF9F5] border border-[#D8D2C2] rounded-xl p-5">
        <div className="text-xs font-bold uppercase tracking-wider text-[#5C615D] mb-3 pb-2 border-b border-[#E4DFD3] flex items-center justify-between">
          <span>Карта объекта / Пациент</span>
          <span className="font-mono-code">CASE DOSSIER</span>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-xs text-[#5C615D]">Объект наблюдения</dt>
            <dd className="font-semibold text-[#181A18] mt-0.5">{step.patientInfo.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#5C615D]">Возраст / Год оценки</dt>
            <dd className="font-mono-code font-semibold text-[#181A18] mt-0.5 tabular-nums">
              {step.patientInfo.age > 1900
                ? `${step.patientInfo.age} г.`
                : `${step.patientInfo.age} лет`}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#5C615D]">Контекст / Статус</dt>
            <dd className="font-medium text-[#1E4631] mt-0.5">{step.patientInfo.role}</dd>
          </div>
        </dl>
      </div>

      {/* Clinical Situation */}
      <div className="bg-[#F9F4EE] border border-[#E0C8B0] rounded-xl p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9A4B26]">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Описание ситуации и анамнез</span>
        </div>
        <p
          className="text-sm sm:text-[15.5px] text-[#181A18] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatInlineHtml(step.situation) }}
        />
      </div>

      {/* Decision Options */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-[#5C615D]">
          Выберите научно обоснованный протокол действий:
        </p>

        {step.options.map((option, idx) => {
          const isSelected = option.id === localSelection;
          const isCorrectOption = option.isCorrect;
          const labelCode = String.fromCharCode(65 + idx);

          let cardStyle =
            'bg-white border-[#E4DFD3] hover:border-[#1E4631] hover:bg-[#FBF9F5]';
          let badgeStyle = 'bg-[#F3EFE6] border-[#D8D2C2] text-[#181A18]';

          if (hasAnswered) {
            if (isSelected && isCorrectOption) {
              cardStyle = 'bg-[#F2F7F4] border-[#1E4631]';
              badgeStyle = 'bg-[#1E4631] border-[#1E4631] text-white';
            } else if (isSelected && !isCorrectOption) {
              cardStyle = 'bg-[#FDF4F3] border-[#9E2A2B]';
              badgeStyle = 'bg-[#9E2A2B] border-[#9E2A2B] text-white';
            } else {
              cardStyle = 'bg-[#FBF9F5] border-[#E4DFD3] opacity-65';
            }
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              disabled={hasAnswered}
              className={`w-full flex items-start gap-4 p-4 sm:p-5 rounded-xl border text-left transition-colors ${cardStyle} ${
                !hasAnswered ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 font-mono-code text-xs font-bold mt-0.5 ${badgeStyle}`}
              >
                {hasAnswered && isSelected && isCorrectOption ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : hasAnswered && isSelected && !isCorrectOption ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  labelCode
                )}
              </div>

              <span
                className="text-sm sm:text-[15px] text-[#181A18] leading-relaxed flex-1"
                dangerouslySetInnerHTML={{ __html: formatInlineHtml(option.text) }}
              />
            </button>
          );
        })}
      </div>

      {/* Outcome Feedback */}
      {hasAnswered && selectedOption && (
        <div
          className={`rounded-xl border p-5 sm:p-6 space-y-3 animate-in ${
            isCorrect
              ? 'bg-[#F4F8F5] border-[#B8D1C1]'
              : 'bg-[#FDF6F5] border-[#E4BDBC]'
          }`}
        >
          <div className="flex items-center gap-2 pb-2.5 border-b border-black/10">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-[#1E4631] shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1E4631]">
                  Протокол утвержден · Клинически и научно верно
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-[#9E2A2B] shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#9E2A2B]">
                  Критический риск · Ошибочное решение
                </span>
              </>
            )}
          </div>

          <p
            className="text-sm sm:text-[15px] text-[#181A18] leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: formatInlineHtml(selectedOption.feedback),
            }}
          />

          {!isCorrect && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#D8D2C2] rounded-lg text-xs font-semibold text-[#181A18] hover:bg-[#F3EFE6] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Выбрать другой протокол действий</span>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
