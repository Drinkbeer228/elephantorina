import { useState } from 'react';
import { Layers, RotateCcw } from 'lucide-react';
import { FlashcardStep as FlashcardStepType } from '../../types/course';

interface Props {
  step: FlashcardStepType;
}

export default function FlashcardStep({ step }: Props) {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const toggleCard = (index: number) => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const allFlipped = flippedCards.size === step.cards.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
          <Layers className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
            {step.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Нажмите на карточку, чтобы перевернуть • {flippedCards.size}/{step.cards.length} изучено
          </p>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {step.cards.map((card, index) => {
          const isFlipped = flippedCards.has(index);

          return (
            <div
              key={index}
              className="perspective-1000 cursor-pointer group"
              onClick={() => toggleCard(index)}
            >
              <div
                className={`
                  relative w-full h-64 transition-transform duration-700 ease-in-out
                  [transform-style:preserve-3d]
                  ${isFlipped ? '[transform:rotateY(180deg)]' : ''}
                `}
              >
                {/* Front */}
                <div className="absolute inset-0 [backface-visibility:hidden] rounded-3xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-lg p-6 flex flex-col items-center justify-center text-center group-hover:shadow-xl transition-shadow">
                  <span className="text-4xl mb-4">📝</span>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {card.term}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
                    Нажмите, чтобы узнать →
                  </p>
                </div>

                {/* Back */}
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 border-2 border-indigo-200 dark:border-indigo-700 shadow-lg p-5 flex flex-col items-center justify-center text-center">
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {card.definition}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-indigo-500">
                    <RotateCcw className="w-3 h-3" />
                    <span className="text-xs">Перевернуть обратно</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* All flipped indicator */}
      {allFlipped && (
        <div className="p-4 bg-emerald-50/80 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-700/50 text-center animate-in fade-in duration-300">
          <span className="text-2xl">🎉</span>
          <p className="text-emerald-700 dark:text-emerald-300 font-medium mt-1">
            Отлично! Все карточки изучены!
          </p>
          <button
            onClick={() => setFlippedCards(new Set())}
            className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Начать заново
          </button>
        </div>
      )}
    </div>
  );
}
