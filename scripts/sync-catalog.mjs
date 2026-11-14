// Обновляет src/bank/books.json — снимок каталога библиотеки Research Station (Elephantology).
// Источник: путь к catalog.json или URL. По умолчанию — фикстура соседнего репозитория research-station.
//   node scripts/sync-catalog.mjs [path-or-url]
import { readFile, writeFile } from 'node:fs/promises';

const src = process.argv[2] ?? '../research-station/tests/e2e/fixtures/library/catalog.json';
const raw = /^https?:/.test(src) ? await (await fetch(src)).text() : await readFile(src, 'utf8');
const catalog = JSON.parse(raw);
if (catalog.schema !== 'elephantology.library/1') throw new Error('Неизвестная схема каталога: ' + catalog.schema);

const disciplines = catalog.disciplines
  .slice()
  .sort((a, b) => a.order - b.order)
  .map(({ id, name, order, description }) => ({ id, name, order, description }));
const known = new Set(disciplines.map((d) => d.id));

// Тесты бывают только по статьям: обзоры дисциплин, словарь и служебные книги не берём.
const books = catalog.books
  .filter((b) => b.kind === 'article' && known.has(b.discipline) && b.id !== 'anatomy/tiny')
  .map(({ id, discipline, title, shortTitle, readingMinutes }) => ({ id, discipline, title, shortTitle, readingMinutes }));

const out = { generatedAt: catalog.generatedAt, source: catalog.source, disciplines, books };
await writeFile(new URL('../src/bank/books.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log(`books.json: ${books.length} книг, ${disciplines.length} дисциплин (каталог от ${catalog.generatedAt})`);
