import { BANK } from '../bank';
import { LESSON_LINKS } from '../bank/lessonLinks';
import { testQuestions } from '../bank/build';
import { bookUrl } from '../app/station';
import { mistakes as mistakeIds, type Progress } from '../test/progress';
import { PASS_PERCENT, DEFAULT_SIZE } from '../test/session';
import { Icon, Link, discColor, disciplineName, formatDate, plural, topicCounts } from './common';

export function TopicPage({ id, progress }: { id: string; progress: Progress }) {
  const book = BANK.books.get(id);
  const topic = BANK.topics.get(id);

  if (!book) {
    return (
      <main className="wrap py-14">
        <div className="eyebrow">Книга не найдена</div>
        <h1 className="h1 mt-3">Такой книги нет в каталоге</h1>
        <p className="lead mt-3">
          Ссылка могла устареть. <code className="text-[14px]">{id}</code>
        </p>
        <Link to={{ kind: 'home' }} className="btn mt-6">К списку тестов</Link>
      </main>
    );
  }

  const color = discColor(book.discipline);
  const counts = topicCounts(id);
  const rec = progress.topics[id];
  const wrongHere = topic ? testQuestions(BANK, id).filter((q) => mistakeIds(progress).has(q.id)).length : 0;
  const unchecked = topic?.sources.some((s) => s.kind === 'course' && LESSON_LINKS.find((l) => l.lesson === s.lesson && !l.checked));

  return (
    <main className="wrap pb-24" style={{ ['--disc' as string]: color }}>
      <div className="pt-6">
        <Link to={{ kind: 'home' }} className="pill quiet !px-2 -ml-2">
          <Icon name="arrow-left" size={16} /> Все книги
        </Link>
      </div>

      <section className="pt-6 pb-8">
        <div className="eyebrow flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-[3px]" style={{ background: color }} />
          {disciplineName(book.discipline)}
        </div>
        <h1 className="h1 mt-3 !text-[clamp(23px,3.6vw,30px)]">{book.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a href={bookUrl(id)} className="pill">
            <Icon name="book" size={16} /> Читать в библиотеке
            <span className="muted font-normal num">· {book.readingMinutes} мин</span>
          </a>
        </div>
      </section>

      {!topic ? (
        <section className="card p-6">
          <div className="h2">Теста по этой книге пока нет</div>
          <p className="muted mt-2">
            Книга стоит в <Link to={{ kind: 'list' }} className="underline">списке на наполнение</Link>. Как только в базе появятся
            вопросы, здесь откроется тест.
          </p>
        </section>
      ) : (
        <div className="grid gap-4">
          <section className="card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="eyebrow">Тест</div>
                <div className="h2 mt-1.5 num">{plural(counts.total, 'вопрос', 'вопроса', 'вопросов')}</div>
                <div className="muted text-[14px] mt-1 num">
                  {counts.own > 0 && plural(counts.own - counts.cases, 'по тексту', 'по тексту', 'по тексту')}
                  {counts.cases > 0 && ` · ${plural(counts.cases, 'случай', 'случая', 'случаев')}`}
                  {counts.terms > 0 && ` · ${counts.terms} на термины`}
                  {counts.total > DEFAULT_SIZE && ` · за раз ${DEFAULT_SIZE}`}
                </div>
              </div>
              {rec && (
                <div className="text-right">
                  <div className={`tag ${rec.passed ? 'ok' : ''} num`}>
                    {rec.passed && <Icon name="check" size={13} />}
                    {rec.passed ? `сдано · лучший ${rec.best}%` : `последний ${rec.last}%`}
                  </div>
                  <div className="muted text-[12.5px] mt-1.5">
                    {plural(rec.attempts, 'попытка', 'попытки', 'попыток')}, {formatDate(rec.at)}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              <Link to={{ kind: 'test', scope: 'book', id, mode: 'practice' }} className="btn primary">
                Тренировка
                <span className="font-normal opacity-80 text-[13.5px]">с разбором</span>
              </Link>
              <Link to={{ kind: 'test', scope: 'book', id, mode: 'exam' }} className="btn">
                Зачёт
                <span className="muted font-normal text-[13.5px]">без подсказок</span>
              </Link>
            </div>
            <p className="muted text-[13px] mt-3">
              Зачёт засчитывается от {PASS_PERCENT}%. {wrongHere > 0 && `Вопросы, где вы ошиблись (${wrongHere}), попадут в тест первыми.`}
            </p>
          </section>

          {topic.terms.length > 0 && (
            <Link to={{ kind: 'terms', id }} className="card p-5 sm:p-6 flex items-center gap-4 no-underline hover:-translate-y-px transition-transform">
              <div className="w-11 h-11 rounded-xl grid place-items-center bg-[color:var(--sand)]">
                <Icon name="cards" />
              </div>
              <div className="flex-1">
                <div className="h2 !text-[19px]">Термины</div>
                <div className="muted text-[14px] num">{plural(topic.terms.length, 'карточка', 'карточки', 'карточек')} — повторить перед тестом</div>
              </div>
              <Icon name="arrow-right" />
            </Link>
          )}

          <details className="card-soft px-5 py-4 text-[14px]">
            <summary className="cursor-pointer font-semibold">Откуда вопросы</summary>
            <ul className="mt-3 grid gap-1.5 muted list-none p-0 m-0">
              {topic.sources.map((s, i) => (
                <li key={i}>
                  {s.kind === 'course' ? (
                    <>Курс Elephantorina · {s.lessonTitle}</>
                  ) : (
                    <>База знаний · <code>{s.file}</code></>
                  )}
                </li>
              ))}
            </ul>
            {unchecked && (
              <p className="mt-3 text-[13px]">
                Часть уроков привязана к книге по названию и ещё не сверена с текстом книги.
              </p>
            )}
          </details>
        </div>
      )}
    </main>
  );
}
