import { useCallback, useEffect, useMemo, useState } from 'react';
import { BANK } from '../bank';
import { testQuestions } from '../bank/build';
import type { Question } from '../bank/types';
import { href, navigate, type Route } from '../app/router';
import { bookUrl } from '../app/station';
import { mistakes as mistakeIds, recordSummary, seen, type Progress } from '../test/progress';
import {
  answeredCount,
  createSession,
  goTo,
  grade,
  pick,
  summarize,
  optionText,
  PASS_PERCENT,
  type Session,
  type Summary,
} from '../test/session';
import { ALL_QUESTIONS, Icon, Link, Rich, RichBlock, bookLabel, discColor, disciplineName, plural } from './common';

type TestRoute = Extract<Route, { kind: 'test' }>;

function poolFor(route: TestRoute, progress: Progress): { title: string; pool: Question[]; size?: number; book: string | null } {
  if (route.scope === 'book') {
    const b = BANK.books.get(route.id);
    return { title: b ? bookLabel(b) : route.id, pool: testQuestions(BANK, route.id), book: route.id };
  }
  if (route.scope === 'mistakes') {
    const ids = mistakeIds(progress);
    const pool = [...ids].map((id) => ALL_QUESTIONS.get(id)?.question).filter((q): q is Question => !!q);
    return { title: 'Работа над ошибками', pool, size: 30, book: null };
  }
  const books = [...BANK.topics.keys()].filter((id) => !route.discipline || BANK.books.get(id)?.discipline === route.discipline);
  return {
    title: route.discipline ? `Смешанный тест · ${disciplineName(route.discipline)}` : 'Смешанный тест',
    // В общий смешанный тест идут и вопросы без привязки к книге — пока их не разобрали по книгам.
    pool: [...books.flatMap((id) => testQuestions(BANK, id)), ...(route.discipline ? [] : BANK.loose.map((l) => l.question))],
    book: null,
  };
}

export function TestRunner({ route, progress, update }: { route: TestRoute; progress: Progress; update: (fn: (p: Progress) => Progress) => void }) {
  const routeKey = href(route);
  const [run, setRun] = useState(0);
  // Пул фиксируется на старте: ответы во время теста не должны менять набор вопросов.
  const setup = useMemo(() => poolFor(route, progress), [routeKey, run]); // eslint-disable-line react-hooks/exhaustive-deps
  const [session, setSession] = useState<Session | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    setSummary(null);
    setSession(
      setup.pool.length
        ? createSession(setup.pool, {
            mode: route.mode,
            size: setup.size,
            // Сначала вопросы с ошибками, затем ещё не пройденные.
            weak: route.scope === 'mistakes' ? undefined : mistakeIds(progress),
            seen: route.scope === 'mistakes' ? undefined : seen(progress),
          })
        : null,
    );
  }, [setup]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = useCallback(
    (s: Session) => {
      const sum = summarize(s);
      setSummary(sum);
      update((p) => recordSummary(p, sum, setup.book, route.mode));
      window.scrollTo({ top: 0 });
    },
    [setup.book, update, route.mode],
  );

  if (!setup.pool.length) {
    return (
      <main className="wrap py-14">
        <div className="eyebrow">{setup.title}</div>
        <h1 className="h1 mt-3">{route.scope === 'mistakes' ? 'Ошибок нет' : 'Вопросов пока нет'}</h1>
        <p className="lead mt-3">
          {route.scope === 'mistakes' ? 'Все вопросы, где вы ошибались, уже отвечены верно.' : 'Для этого теста в базе ещё нет вопросов.'}
        </p>
        <Link to={{ kind: 'home' }} className="btn mt-6">К книгам</Link>
      </main>
    );
  }
  if (!session) return null;
  if (summary) {
    return (
      <Result
        title={setup.title}
        summary={summary}
        book={setup.book}
        mode={route.mode}
        onRetry={() => setRun((n) => n + 1)}
        onOtherMode={() => navigate({ ...route, mode: route.mode === 'exam' ? 'practice' : 'exam' } as TestRoute)}
      />
    );
  }
  return <Runner title={setup.title} book={setup.book} session={session} setSession={setSession} onFinish={finish} />;
}

function Runner({
  title,
  book,
  session,
  setSession,
  onFinish,
}: {
  title: string;
  book: string | null;
  session: Session;
  setSession: (s: Session) => void;
  onFinish: (s: Session) => void;
}) {
  const item = session.items[session.index]!;
  const q = item.question;
  const practice = session.mode === 'practice';
  const revealed = practice && item.picked !== null;
  const isLast = session.index === session.items.length - 1;
  const answered = answeredCount(session);
  const g = revealed ? grade(item) : null;
  const located = ALL_QUESTIONS.get(q.id);
  const qBook = book ?? located?.book ?? null;

  const next = useCallback(() => {
    if (practice && item.picked === null) return;
    if (!isLast) {
      setSession(goTo(session, session.index + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const left = session.items.length - answeredCount(session);
    if (left > 0 && !window.confirm(`Без ответа ${plural(left, 'вопрос', 'вопроса', 'вопросов')}. Завершить?`)) return;
    onFinish(session);
  }, [practice, item.picked, isLast, session, setSession, onFinish]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[1-9]$/.test(e.key)) {
        const i = Number(e.key) - 1;
        if (i < item.order.length) setSession(pick(session, i));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' && session.index > 0) {
        setSession(goTo(session, session.index - 1));
      } else if (e.key === 'ArrowRight' && (!practice || item.picked !== null) && !isLast) {
        setSession(goTo(session, session.index + 1));
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [session, item, next, practice, isLast, setSession]);

  const color = qBook ? discColor(BANK.books.get(qBook)?.discipline) : undefined;

  return (
    <>
      <main className="wrap pb-40" style={color ? { ['--disc' as string]: color } : undefined}>
        <div className="pt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            className="pill quiet !px-2 -ml-2"
            onClick={() => {
              if (answered === 0 || window.confirm('Выйти из теста? Ответы не сохранятся.'))
                navigate(book ? { kind: 'book', id: book } : { kind: 'home' });
            }}
          >
            <Icon name="x" size={16} /> Выйти
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <span className={`tag ${practice ? 'line' : ''}`}>{practice ? 'тренировка' : 'зачёт'}</span>
            <span className="muted text-[13px] num">
              {session.index + 1} / {session.items.length}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="eyebrow truncate">{title}</div>
          <div className="track mt-3" role="navigation" aria-label="Вопросы теста">
            {session.items.map((it, i) => {
              const done = it.picked !== null;
              const cls = practice && done ? (grade(it).correct ? 'ok' : 'no') : done ? 'done' : '';
              const locked = practice && !done && i > session.index;
              return (
                <button
                  key={it.question.id}
                  type="button"
                  className={`${cls} ${i === session.index ? 'cur' : ''}`}
                  aria-label={`Вопрос ${i + 1}${done ? ', отвечен' : ''}`}
                  disabled={locked}
                  onClick={() => setSession(goTo(session, i))}
                />
              );
            })}
          </div>
        </div>

        <article key={q.id} className="fade-in mt-8">
          {q.kind === 'case' ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="tag bad">случай</span>
                {q.subject && (
                  <span className="muted text-[13.5px]">
                    {q.subject.name}
                    {q.subject.age !== undefined && `, ${q.subject.age} ${plural(q.subject.age, 'год', 'года', 'лет').split(' ')[1]}`}
                    {q.subject.role && ` · ${q.subject.role}`}
                  </span>
                )}
              </div>
              <h2 className="serif text-[21px] font-semibold leading-snug mt-3 m-0">{q.title}</h2>
              <div className="card-soft mt-4 p-4 sm:p-5 text-[15.5px] leading-relaxed">
                <RichBlock text={q.situation} />
              </div>
              <p className="eyebrow mt-6 mb-0">Ваше решение</p>
            </>
          ) : (
            <h2 className="serif text-[clamp(20px,3.6vw,24px)] font-semibold leading-snug m-0">
              <Rich text={q.prompt} />
            </h2>
          )}

          <div className="mt-4 grid gap-2.5" role="radiogroup">
            {item.order.map((orig, i) => {
              const text = optionText(q, orig);
              const isPicked = item.picked === i;
              let cls = '';
              if (revealed) {
                const right = q.kind === 'choice' ? q.answer === orig : q.options[orig]?.correct;
                cls = right ? 'right' : isPicked ? 'wrong' : 'dim';
              } else if (isPicked) cls = 'sel';
              return (
                <button
                  key={orig}
                  type="button"
                  role="radio"
                  aria-checked={isPicked}
                  className={`opt ${cls}`}
                  disabled={revealed}
                  onClick={() => setSession(pick(session, i))}
                >
                  <span className="key">{revealed && cls === 'right' ? <Icon name="check" size={14} /> : revealed && cls === 'wrong' ? <Icon name="x" size={14} /> : i + 1}</span>
                  <Rich text={text} className="pt-px" />
                </button>
              );
            })}
          </div>

          {g && (
            <div className={`note fade-in mt-5 ${g.correct ? '' : 'bad'}`} aria-live="polite">
              <div className="font-bold mb-1.5" style={{ color: g.correct ? 'var(--sage)' : 'var(--terra)' }}>
                {g.correct ? 'Верно' : 'Неверно'}
              </div>
              {g.note ? <RichBlock text={g.note} className="text-[15px] leading-relaxed" /> : !g.correct && <div className="text-[15px]">Правильно: <Rich text={g.correctText} className="font-semibold" /></div>}
              {!g.correct && qBook && (
                <a href={bookUrl(qBook)} className="inline-flex items-center gap-1.5 mt-3 text-[14px] font-semibold underline underline-offset-2">
                  <Icon name="book" size={15} /> Перечитать в книге
                </a>
              )}
            </div>
          )}
        </article>
      </main>

      <nav className="dock">
        <div className="wrap flex gap-2.5 py-3">
          <button
            type="button"
            className="btn !px-0 w-14 shrink-0"
            onClick={() => setSession(goTo(session, session.index - 1))}
            disabled={session.index === 0}
            aria-label="Предыдущий вопрос"
          >
            <Icon name="arrow-left" />
          </button>
          <button
            type="button"
            className={`btn flex-1 ${item.picked !== null ? 'primary' : ''}`}
            onClick={next}
            disabled={practice ? item.picked === null : false}
          >
            {isLast ? 'Завершить' : practice || item.picked !== null ? 'Дальше' : 'Пропустить'}
            <span className="kbd hidden sm:inline">Enter</span>
          </button>
        </div>
      </nav>
    </>
  );
}

function Result({
  title,
  summary,
  book,
  mode,
  onRetry,
  onOtherMode,
}: {
  title: string;
  summary: Summary;
  book: string | null;
  mode: 'practice' | 'exam';
  onRetry: () => void;
  onOtherMode: () => void;
}) {
  const wrong = summary.graded.filter((g) => !g.correct);
  const minutes = Math.max(1, Math.round(summary.durationMs / 60000));
  const ringColor = summary.passed ? 'var(--sage)' : summary.percent >= 50 ? 'var(--gold)' : 'var(--terra)';
  // Книги, к которым стоит вернуться: по ошибкам.
  const reread = [...new Set(wrong.map((g) => book ?? ALL_QUESTIONS.get(g.item.question.id)?.book).filter((b): b is string => !!b))];

  return (
    <main className="wrap pb-24">
      <section className="pt-10 pb-8 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="ring shrink-0" style={{ ['--p' as string]: summary.percent, ['--ring' as string]: ringColor }}>
          <div>
            <div className="text-center">
              <div className="serif text-[34px] font-semibold leading-none num">{summary.percent}%</div>
              <div className="muted text-[12.5px] mt-1 num">
                {summary.correct} из {summary.total}
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="eyebrow">{title} · {mode === 'exam' ? 'зачёт' : 'тренировка'}</div>
          <h1 className="h1 mt-2">
            {mode === 'exam'
              ? summary.passed
                ? 'Зачёт сдан'
                : 'Зачёт не сдан'
              : summary.passed
                ? 'Тренировка пройдена'
                : 'Стоит повторить'}
          </h1>
          <p className="lead mt-2">
            {summary.passed
              ? wrong.length
                ? `Разберите ${plural(wrong.length, 'ошибку', 'ошибки', 'ошибок')} ниже — они попадут в «Работу над ошибками».`
                : `Около ${plural(minutes, 'минуты', 'минут', 'минут')}.`
              : `Для зачёта нужно ${PASS_PERCENT}%. Перечитайте отмеченные места и попробуйте ещё раз.`}
            {mode === 'practice' && book && ' Отметку «Зачёт сдан» ставит только режим зачёта.'}
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2.5">
        <button type="button" className="btn primary" onClick={onRetry}>
          <Icon name="repeat" size={17} /> Ещё раз
        </button>
        {book && mode === 'practice' && summary.passed && (
          <button type="button" className="btn" onClick={onOtherMode}>
            Сдать зачёт
          </button>
        )}
        {book && (
          <a href={bookUrl(book)} className="btn">
            <Icon name="book" size={17} /> Книга
          </a>
        )}
        <Link to={book ? { kind: 'book', id: book } : { kind: 'home' }} className="btn ghost">
          {book ? 'К тесту' : 'К книгам'}
        </Link>
      </div>

      {reread.length > 0 && !book && (
        <section className="mt-10">
          <div className="eyebrow mb-3">Что перечитать</div>
          <div className="flex flex-wrap gap-2">
            {reread.map((id) => {
              const b = BANK.books.get(id)!;
              return (
                <a key={id} href={bookUrl(id)} className="pill" style={{ height: 'auto', padding: '9px 12px' }}>
                  <span className="dot" style={{ color: discColor(b.discipline) }} />
                  <span className="max-w-[260px] truncate">{bookLabel(b)}</span>
                  <Icon name="external" size={14} />
                </a>
              );
            })}
          </div>
        </section>
      )}

      {wrong.length > 0 && (
        <section className="mt-10">
          <h2 className="h2 mb-4">Разбор ошибок</h2>
          <div className="grid gap-3">
            {wrong.map((g) => {
              const q = g.item.question;
              return (
                <article key={q.id} className="card p-5">
                  <div className="serif text-[17.5px] font-semibold leading-snug">
                    <Rich text={q.kind === 'case' ? q.title : q.prompt} />
                  </div>
                  <div className="mt-3 grid gap-1.5 text-[14.5px]">
                    <div className="flex gap-2">
                      <span className="shrink-0 mt-0.5" style={{ color: 'var(--terra)' }}><Icon name="x" size={16} /></span>
                      <span>{g.pickedText ? <Rich text={g.pickedText} /> : <span className="muted">без ответа</span>}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="shrink-0 mt-0.5" style={{ color: 'var(--sage)' }}><Icon name="check" size={16} /></span>
                      <Rich text={g.correctText} className="font-semibold" />
                    </div>
                  </div>
                  {g.note && <RichBlock text={g.note} className="muted text-[14.5px] leading-relaxed mt-3 [&_p]:m-0 [&_p+p]:mt-2" />}
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
