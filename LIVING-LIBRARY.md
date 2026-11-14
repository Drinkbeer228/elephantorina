# Живая библиотека — задачи в этом репозитории

Главная дорожная карта, принципы и галочки — в research-station:
https://github.com/Drinkbeer228/research-station/blob/main/docs/living-library/ROADMAP.md

Карточки ниже можно делать, не открывая другие репозитории. Сделали — в PR напишите «закрывает шаг N из ROADMAP research-station».
Принципы коротко: текст статей не менять, авторов и источники не выдумывать, интерфейс на русском, проверки соразмерные, сливать merge commit (не squash).

Связь с библиотекой: книги Research Station ссылаются на тест книги адресом `?book=<id книги>`; список книг с тестами — `ELEPHANTORINA_BOOKS` в research-station `src/library/connections.ts`. Старый адрес `?course=<courseId>&lesson=<lessonId>` тоже работает: урок переводится на книгу через `src/bank/lessonLinks.ts` (разбор адреса — `src/app/router.ts`). Когда у книги появляется тест (`npm run coverage`), добавьте её в `ELEPHANTORINA_BOOKS` там.

## Карточки

- [x] **3.5 [EO]** `npm test` в elephantorina не находит тестов: `tsx --test "src/**/*.test.ts"` не раскрывает шаблон. Заменить на явный список или на `find src -name '*.test.ts' | xargs tsx --test`. Сделано в #10 (`scripts/run-tests.mjs`).
