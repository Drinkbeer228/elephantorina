/** Адреса Research Station. Меняются переменной окружения VITE_STATION_URL при сборке. */
const base: string = import.meta.env?.VITE_STATION_URL || 'https://drinkbeer228.github.io/research-station/';

export const STATION_URL = base.endsWith('/') ? base : base + '/';

/** Книга в библиотеке станции (маршрут `#/library/<id>` в Research Station). */
export const bookUrl = (id: string): string => `${STATION_URL}#/library/${id}`;

/** Каталог библиотеки. */
export const catalogUrl = (): string => `${STATION_URL}#/library/catalog`;
