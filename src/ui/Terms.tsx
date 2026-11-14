import { useEffect, useMemo, useState } from 'react';
import { BANK } from '../bank';
import { rng, shuffle } from '../test/session';
import { Icon, Link, Rich, bookLabel, discColor, plural } from './common';

/** Карточки терминов: перевернуть, отметить «знаю» или «повторить». Невыученные идут по кругу. */
export function Terms({ id }: { id: string }) {
  const topic = BANK.topics.get(id);
  const book = BANK.books.get(id);
  const [round, setRound] = useState(0);
  const deck = useMemo(() => shuffle(topic?.terms ?? [], rng(Date.now())), [topic, round]);
  const [queue, setQueue] = useState(deck);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);

  useEffect(() => {
    setQueue(deck);
    setKnown(0);
    setFlipped(false);
  }, [deck]);

  const card = queue[0];
  const answer = (ok: boolean) => {
    if (!card) return;
    setFlipped(false);
    if (ok) setKnown((k) => k + 1);
    // «Повторить» — карточка уходит в конец очереди.
    setQueue((q) => (ok ? q.slice(1) : [...q.slice(1), card]));
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && (e.key === '1' || e.key === 'ArrowLeft')) answer(false);
      else if (flipped && (e.key === '2' || e.key === 'ArrowRight')) answer(true);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  if (!topic || !book || topic.terms.length === 0) {
    return (
      <main className="wrap py-14">
        <h1 className="h1">Карточек нет</h1>
        <Link to={{ kind: 'home' }} className="btn mt-6">К книгам</Link>
      </main>
    );
  }

  const total = deck.length;

  return (
    <main className="wrap pb-24" style={{ ['--disc' as string]: discColor(book.discipline) }}>
      <div className="pt-6 flex items-center justify-between">
        <Link to={{ kind: 'book', id }} className="pill quiet !px-2 -ml-2">
          <Icon name="arrow-left" size={16} /> К тесту
        </Link>
        <span className="muted text-[13px] num">
          знаю {known} из {total}
        </span>
      </div>
      <div className="mt-4">
        <div className="eyebrow truncate">Термины · {bookLabel(book)}</div>
        <div className="track mt-3" aria-hidden>
          {deck.map((t, i) => (
            <button key={t.id} type="button" tabIndex={-1} className={i < known ? 'ok' : ''} />
          ))}
        </div>
      </div>

      {card ? (
        <>
          <button
            type="button"
            className={`flip mt-8 block w-full text-left ${flipped ? 'on' : ''}`}
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? 'Показать термин' : 'Показать определение'}
          >
            <div className="flip-in">
              <div className="face card">
                <div className="eyebrow">Термин</div>
                <div className="serif text-[clamp(24px,5vw,32px)] font-semibold leading-tight mt-3">
                  <Rich text={card.term} />
                </div>
                <div className="muted text-[13.5px] mt-auto pt-6">Нажмите, чтобы увидеть определение · Пробел</div>
              </div>
              <div className="face back card" style={{ background: 'var(--sand)' }}>
                <div className="eyebrow">{card.term}</div>
                <Rich as="p" text={card.definition} className="text-[17px] leading-relaxed mt-3 m-0" />
              </div>
            </div>
          </button>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <button type="button" className="btn" disabled={!flipped} onClick={() => answer(false)}>
              Повторить <span className="kbd hidden sm:inline">1</span>
            </button>
            <button type="button" className="btn primary" disabled={!flipped} onClick={() => answer(true)}>
              Знаю <span className="kbd hidden sm:inline">2</span>
            </button>
          </div>
        </>
      ) : (
        <section className="card p-6 mt-8 text-center">
          <div className="h2">Все {plural(total, 'термин', 'термина', 'терминов')} пройдены</div>
          <p className="muted mt-2">Теперь можно проверить себя тестом.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            <Link to={{ kind: 'test', scope: 'book', id, mode: 'practice' }} className="btn primary">
              К тесту
            </Link>
            <button type="button" className="btn" onClick={() => setRound((r) => r + 1)}>
              Ещё круг
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
