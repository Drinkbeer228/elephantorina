import { useMemo, useState } from 'react';
import { BANK } from '../bank';
import { catalogUrl } from '../app/station';
import { mistakes as mistakeIds, topicStatus, type Progress } from '../test/progress';
import { Icon, Link, bookLabel, discColor, plural, topicCounts } from './common';

export function Home({ progress }: { progress: Progress }) {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();

  const groups = useMemo(() => {
    return BANK.catalog.disciplines.map((d) => {
      const all = BANK.catalog.books.filter((b) => b.discipline === d.id);
      const withTests = all.filter((b) => BANK.topics.has(b.id));
      const shown = query
        ? withTests.filter((b) => (b.title + ' ' + b.id).toLowerCase().includes(query))
        : withTests;
      return { d, all, withTests, shown };
    });
  }, [query]);

  const topicIds = [...BANK.topics.keys()];
  const passed = topicIds.filter((id) => topicStatus(progress, id) === 'passed').length;
  const questionTotal = topicIds.reduce((n, id) => n + topicCounts(id).total, 0);
  const wrong = mistakeIds(progress).size;
  const recent = Object.entries(progress.topics)
    .filter(([id]) => BANK.topics.has(id))
    .sort((a, b) => b[1].at.localeCompare(a[1].at))
    .slice(0, 3);
  const nothing = query && groups.every((g) => g.shown.length === 0);

  return (
    <main className="wrap pb-24">
      <section className="pt-10 pb-8 sm:pt-14">
        <div className="eyebrow">Elephant Research Station · экзаменационный зал</div>
        <h1 className="h1 mt-3">Проверить себя по книгам</h1>
        <p className="lead mt-3 max-w-[560px]">
          Каждый тест привязан к книге библиотеки. Прочитали книгу — откройте её тест. Ошиблись — разбор подскажет, что
          перечитать.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="tag line num">{plural(BANK.topics.size, 'книга', 'книги', 'книг')} с тестами из {BANK.catalog.books.length}</span>
          <span className="tag line num">{plural(questionTotal, 'вопрос', 'вопроса', 'вопросов')}</span>
          {passed > 0 && <span className="tag ok num">сдано {passed}</span>}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {wrong > 0 ? (
          <Link to={{ kind: 'test', scope: 'mistakes', mode: 'practice' }} className="card p-5 no-underline block hover:-translate-y-px transition-transform">
            <div className="flex items-center gap-2 text-[color:var(--terra)]">
              <Icon name="repeat" />
              <span className="eyebrow !text-[color:var(--terra)]">Работа над ошибками</span>
            </div>
            <div className="h2 mt-2">{plural(wrong, 'вопрос ждёт', 'вопроса ждут', 'вопросов ждут')} повтора</div>
            <p className="muted mt-1 text-[14.5px]">Верный ответ убирает вопрос из списка.</p>
          </Link>
        ) : (
          <a href={catalogUrl()} className="card p-5 no-underline block hover:-translate-y-px transition-transform">
            <div className="flex items-center gap-2 text-[color:var(--sage)]">
              <Icon name="book" />
              <span className="eyebrow !text-[color:var(--sage)]">Сначала прочитать</span>
            </div>
            <div className="h2 mt-2">Каталог библиотеки</div>
            <p className="muted mt-1 text-[14.5px]">В конце каждой книги есть ссылка «Проверить себя».</p>
          </a>
        )}
        <Link to={{ kind: 'test', scope: 'mix', discipline: null, mode: 'practice' }} className="card p-5 no-underline block hover:-translate-y-px transition-transform">
          <div className="flex items-center gap-2">
            <Icon name="shuffle" />
            <span className="eyebrow">Смешанный тест</span>
          </div>
          <div className="h2 mt-2">12 вопросов из всех книг</div>
          <p className="muted mt-1 text-[14.5px]">Чтобы проверить, что осталось в памяти.</p>
        </Link>
      </section>

      {recent.length > 0 && !query && (
        <section className="mt-10">
          <div className="eyebrow mb-3">Недавно</div>
          <div className="flex flex-wrap gap-2">
            {recent.map(([id, r]) => {
              const b = BANK.books.get(id)!;
              return (
                <Link key={id} to={{ kind: 'book', id }} className="pill" style={{ height: 'auto', padding: '9px 12px' }}>
                  <span className="dot" style={{ color: discColor(b.discipline) }} />
                  <span className="max-w-[220px] truncate">{bookLabel(b)}</span>
                  <span className={`tag ${r.passed ? 'ok' : ''} num`}>{r.last}%</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-10">
        <div className="flex items-end justify-between gap-3 mb-4">
          <h2 className="h2">Книги с тестами</h2>
        </div>
        <label className="card flex items-center gap-3 px-4 h-12 !shadow-none">
          <Icon name="search" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Найти книгу: хобот, EEHV, мамонт…"
            className="flex-1 bg-transparent outline-none text-[15.5px] placeholder:text-[color:var(--faint)]"
            aria-label="Поиск по книгам"
          />
        </label>

        {nothing && <p className="muted mt-6">Ничего не нашлось. Проверьте написание или посмотрите весь <Link to={{ kind: 'list' }} className="underline">список книг</Link>.</p>}

        <div className="mt-6 grid gap-8">
          {groups
            .filter((g) => g.shown.length > 0 || (!query && g.all.length > 0))
            .map(({ d, all, withTests, shown }) => (
              <div key={d.id} style={{ ['--disc' as string]: discColor(d.id) }}>
                <div className="flex items-baseline justify-between gap-3 px-1">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-block w-3 h-3 rounded-[4px]" style={{ background: discColor(d.id), boxShadow: 'inset 0 0 0 1.2px rgba(0,0,0,.25)' }} />
                    <h3 className="serif text-[18px] font-semibold m-0">{d.name}</h3>
                  </div>
                  <span className="muted text-[13px] num">
                    {withTests.length} из {all.length}
                  </span>
                </div>
                {shown.length > 0 ? (
                  <div className="card mt-2.5 p-1.5">
                    {shown.map((b) => {
                      const c = topicCounts(b.id);
                      const st = topicStatus(progress, b.id);
                      const rec = progress.topics[b.id];
                      return (
                        <Link key={b.id} to={{ kind: 'book', id: b.id }} className="row">
                          <div className="spine self-stretch flex-1 min-w-0 flex flex-col justify-center">
                            <div className="serif text-[16.5px] leading-snug font-medium line-clamp-2" title={b.title}>{bookLabel(b)}</div>
                            <div className="muted text-[13px] mt-0.5 num">
                              {plural(c.total, 'вопрос', 'вопроса', 'вопросов')}
                              {c.cases > 0 && ` · ${plural(c.cases, 'случай', 'случая', 'случаев')}`}
                            </div>
                          </div>
                          {st === 'passed' && <span className="tag ok"><Icon name="check" size={13} />{rec?.best}%</span>}
                          {st === 'started' && <span className="tag num">{rec?.last}%</span>}
                          <Icon name="arrow-right" />
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  !query && (
                    <div className="card-soft mt-2.5 px-4 py-3 text-[14px] muted">
                      Тестов пока нет — книги в <Link to={{ kind: 'list' }} className="underline">списке на наполнение</Link>.
                    </div>
                  )
                )}
              </div>
            ))}
        </div>
      </section>
    </main>
  );
}
