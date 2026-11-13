# Живая библиотека — задачи в этом репозитории

Главная дорожная карта, принципы и галочки — в research-station:
https://github.com/Drinkbeer228/research-station/blob/main/docs/living-library/ROADMAP.md

Карточки ниже можно делать, не открывая другие репозитории. Сделали — в PR напишите «закрывает шаг N из ROADMAP research-station».
Принципы коротко: текст статей не менять, авторов и источники не выдумывать, интерфейс на русском, проверки соразмерные, сливать merge commit (не squash).

Связь с библиотекой: книги Research Station ссылаются на уроки адресом `?course=<courseId>&lesson=<lessonId>` (`src/utils/deepLink.ts`). Пары книга → урок лежат в research-station `src/library/connections.ts`. Если меняете id курса или урока в `src/data/coursesData.ts`, отметьте это в PR — ссылки придётся поправить там.

## Карточки

- [ ] **3.5 [EO]** `npm test` в elephantorina не находит тестов: `tsx --test "src/**/*.test.ts"` не раскрывает шаблон. Заменить на явный список или на `find src -name '*.test.ts' | xargs tsx --test`. Проверки: `npm test` находит и проходит `src/utils/deepLink.test.ts`.
