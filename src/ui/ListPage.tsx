import { useMemo } from 'react';
import { BANK } from '../bank';
import { LESSON_LINKS } from '../bank/lessonLinks';
import { coverage, coverageMarkdown, THIN_TOPIC } from '../bank/coverage';
import { bookUrl } from '../app/station';
import { Icon, Link, discColor, plural } from './common';

export function ListPage() {
  const c = useMemo(() => coverage(BANK, LESSON_LINKS), []);
  const pct = Math.round((c.totals.covered / c.totals.books) * 100);

  const download = () => {
    const md = coverageMarkdown(c, BANK.catalog.generatedAt);
    const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'elephantorina-knowledge-base.md';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <main className="wrap pb-24">
      <section className="pt-10 pb-8">
        <div className="eyebrow">Список на наполнение</div>
        <h1 className="h1 mt-3">Что ещё нужно для тестов</h1>
        <p className="lead mt-3 max-w-[580px]">
          Тест появляется у книги, как только в базе есть вопросы по ней. Здесь — книги без тестов, короткие тесты и вопросы,
          которым ещё не нашлась книга.
        </p>
        <div className="card mt-6 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <div className="serif text-[22px] font-semibold num">
              {c.totals.covered} из {c.totals.books} книг
            </div>
            <div className="muted text-[14px] num">{pct}%</div>
          </div>
          <div className="mt-3 h-2.5 rounded-full overflow-hidden bg-[color:var(--sand-2)] flex">
            {c.disciplines.map((d) => (
              <div key={d.id} style={{ width: `${(d.covered / c.totals.books) * 100}%`, background: discColor(d.id) }} title={d.name} />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn !min-h-10 text-[14px]" onClick={download}>
              Скачать список (.md)
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="h2 mb-4">Книги без теста</h2>
        <div className="grid gap-6">
          {c.disciplines
            .filter((d) => d.missing.length)
            .map((d) => (
              <div key={d.id} style={{ ['--disc' as string]: discColor(d.id) }}>
                <div className="flex items-baseline justify-between px-1">
                  <h3 className="serif text-[17px] font-semibold m-0">{d.name}</h3>
                  <span className="muted text-[13px] num">
                    готово {d.covered} из {d.total}
                  </span>
                </div>
                <div className="card mt-2 p-1.5">
                  {d.missing.map((m) => (
                    <a key={m.id} href={bookUrl(m.id)} className="row">
                      <div className="spine flex-1 min-w-0">
                        <div className="text-[15px] leading-snug">{m.title}</div>
                        <code className="muted text-[12px] break-all">{m.id}</code>
                      </div>
                      <Icon name="external" size={16} />
                    </a>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </section>

      {c.disciplines.some((d) => d.thin.length) && (
        <section className="mt-12">
          <h2 className="h2">Короткие тесты</h2>
          <p className="muted mt-1 mb-4 text-[14.5px]">Меньше {THIN_TOPIC} своих вопросов — тест есть, но его стоит дополнить.</p>
          <div className="card p-1.5">
            {c.disciplines.flatMap((d) =>
              d.thin.map((t) => (
                <Link key={t.id} to={{ kind: 'book', id: t.id }} className="row" style={{ ['--disc' as string]: discColor(d.id) }}>
                  <div className="spine flex-1 min-w-0">
                    <div className="text-[15px] leading-snug">{t.title}</div>
                    <code className="muted text-[12px] break-all">{t.id}</code>
                  </div>
                  <span className="tag num shrink-0">{plural(t.own, 'вопрос', 'вопроса', 'вопросов')}</span>
                </Link>
              )),
            )}
          </div>
        </section>
      )}

      {c.unchecked.length > 0 && (
        <section className="mt-12">
          <h2 className="h2">Сверить привязку</h2>
          <p className="muted mt-1 mb-4 text-[14.5px]">
            Эти уроки старого курса привязаны к книгам по названию. Правка — <code>src/bank/lessonLinks.ts</code>.
          </p>
          <div className="card-soft p-4 grid gap-2 text-[14px]">
            {c.unchecked.map((u) => (
              <div key={u.lesson} className="flex flex-wrap gap-x-2">
                <code>{u.lesson}</code>
                <span className="muted">→</span>
                <Link to={{ kind: 'book', id: u.book }} className="underline underline-offset-2">
                  {u.title}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {c.loose.length > 0 && (
        <section className="mt-12">
          <h2 className="h2">Вопросы без книги</h2>
          <p className="muted mt-1 mb-4 text-[14.5px]">
            {plural(c.loose.length, 'вопрос', 'вопроса', 'вопросов')} пока не попадают в тесты: сначала им нужна книга. Привязать
            урок — строкой в <code>src/bank/lessonLinks.ts</code>, отдельный вопрос — перенести в файл темы.
          </p>
          <div className="grid gap-2">
            {c.loose.map((l) => (
              <div key={l.question.id} className="card-soft px-4 py-3 text-[14.5px]">
                <div>{l.question.kind === 'choice' ? l.question.prompt : l.question.title}</div>
                <div className="muted text-[12.5px] mt-1">
                  <code>{l.question.id}</code> · {l.origin}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {c.problems.length > 0 && (
        <section className="mt-12">
          <h2 className="h2" style={{ color: 'var(--terra)' }}>Ошибки в данных</h2>
          <ul className="mt-3 text-[14px]">
            {c.problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
