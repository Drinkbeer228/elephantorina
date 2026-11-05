import { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import { FlashcardStep as FlashcardStepType } from '../../types/course';
import { formatInlineHtml } from '../../utils/courseUtils';

interface Props {
  step: FlashcardStepType;
}

export default function FlashcardStep({ step }: Props) {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    setFlippedCards(new Set());
  }, [step.id]);

  const toggleCard = (index: number) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const revealAll = () => {
    if (flippedCards.size === step.cards.length) {
      setFlippedCards(new Set());
    } else {
      setFlippedCards(new Set(step.cards.map((_, i) => i)));
    }
  };

  const allFlipped = flippedCards.size === step.cards.length;

  return (
    <section className="animate-in bg-white border border-[#E4DFD3] rounded-2xl p-6 sm:p-10 space-y-6">
      {/* Header */}
      <header className="pb-5 border-b border-[#E4DFD3] flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#5C615D] mb-2">
            <span>Терминологический глоссарий</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              Изучено {flippedCards.size} из {step.cards.length} карточек
            </span>
          </div>
          <h1
            className="font-display text-2xl sm:text-3xl font-bold text-[#181A18] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            {step.title}
          </h1>
        </div>

        <button
          type="button"
          onClick={revealAll}
          className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#181A18] bg-[#F3EFE6] hover:bg-[#E4DFD3] border border-[#D8D2C2] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {allFlipped ? 'Скрыть определения' : 'Раскрыть все карточки'}
        </button>
      </header>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {step.cards.map((card, index) => {
          const isFlipped = flippedCards.has(index);

          return (
            <button
              key={index}
              type="button"
              onClick={() => toggleCard(index)}
              aria-label={`Карточка ${index + 1}: ${card.term}. Нажмите для переворота`}
              className="perspective-1000 text-left cursor-pointer group focus:outline-none"
            >
              <div
                className={`relative w-full min-h-[220px] transition-transform duration-500 transform-style-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front Face (Term) */}
                <div className="absolute inset-0 backface-hidden rounded-xl bg-[#FBF9F5] border border-[#D8D2C2] group-hover:border-[#1E4631] p-6 flex flex-col justify-between transition-colors">
                  <div className="flex items-center justify-between text-xs text-[#5C615D]">
                    <span className="font-mono-code font-semibold text-[#1E4631]">
                      ТЕРМИН #{String(index + 1).padStart(2, '0')}
                    </span>
                    <span>Нажмите для определения →</span>
                  </div>

                  <div className="my-auto py-4">
                    <h2 className="font-display text-2xl font-bold text-[#181A18] leading-snug">
                      {card.term}
                    </h2>
                  </div>

                  <div className="text-xs text-[#7A7F7A] border-t border-[#E4DFD3] pt-3 flex items-center justify-between">
                    <span>Слонология · Индекс понятий</span>
                    <RotateCcw className="w-3.5 h-3.5 text-[#5C615D]" />
                  </div>
                </div>

                {/* Back Face (Definition) */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl bg-[#1E4631] text-white border border-[#1E4631] p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-white/75 border-b border-white/15 pb-2.5">
                    <span className="font-semibold truncate max-w-[200px]">{card.term}</span>
                    <span className="font-mono-code text-[11px]">ОПРЕДЕЛЕНИЕ</span>
                  </div>

                  <div className="my-auto py-3">
                    <p
                      className="text-sm sm:text-[15px] text-white/95 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: formatInlineHtml(card.definition),
                      }}
                    />
                  </div>

                  <div className="text-xs text-white/70 border-t border-white/15 pt-2.5 flex items-center justify-between">
                    <span>Нажмите, чтобы вернуть термин</span>
                    <RotateCcw className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Completion Banner */}
      {allFlipped && (
        <div className="p-4 bg-[#F4F8F5] rounded-xl border border-[#B8D1C1] flex items-center justify-between gap-4 animate-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#1E4631] shrink-0" />
            <p className="text-sm font-medium text-[#143322]">
              Все термины модуля просмотрены. Вы можете перейти к следующему шагу.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFlippedCards(new Set())}
            className="text-xs font-semibold text-[#1E4631] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            Сбросить карточки
          </button>
        </div>
      )}
    </section>
  );
}
