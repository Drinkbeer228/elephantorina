/**
 * Встраивание в Research Station (research-station: docs/station/CONTRACT.md, §4).
 * Станция открывает модуль в iframe с `?embedded=1`. Тогда модуль прячет свою шапку станции, отвечает `ready`,
 * присылает заголовок и просит закрыть себя кнопкой «На станцию»; ссылки на станцию уходят ей сообщением `navigate`,
 * а не открывают станцию внутри iframe.
 * Вычисляется при первом импорте, до того как App уберёт `?book=` из адреса.
 */
import { STATION_URL } from './station';

const MODULE = 'elephantorina';
const STATION_ORIGIN = new URL(STATION_URL).origin;

function detect(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('embedded') === '1' && window.parent !== window;
  } catch {
    return false;
  }
}

export const EMBEDDED: boolean = typeof window !== 'undefined' && detect();

function post(type: string, extra: Record<string, unknown> = {}): void {
  if (!EMBEDDED) return;
  try {
    window.parent.postMessage({ ers: 1, module: MODULE, type, ...extra }, STATION_ORIGIN);
  } catch {
    /* станция ушла — сообщать некому */
  }
}

/** Заголовок для шапки «планшета» станции. */
export const postTitle = (title: string): void => post('title', { title: title.slice(0, 120) });

/** Кнопка «На станцию» внутри модуля: станция закрывает планшет. */
export const requestClose = (): void => post('close-request');

/** Маршрут станции из ссылки на неё, например `#/library/anatomy/x`; null для чужих ссылок. */
export function stationRoute(href: string): string | null {
  if (!href.startsWith(STATION_URL)) return null;
  const hash = href.slice(STATION_URL.length).replace(/^index\.html/, '');
  return hash.startsWith('#/') ? hash : '#/map';
}

if (EMBEDDED) {
  document.documentElement.classList.add('ers-embedded');
  window.addEventListener('message', (e) => {
    if (e.origin !== STATION_ORIGIN || e.source !== window.parent) return;
    const d = e.data as { ers?: unknown; type?: unknown; reducedMotion?: unknown } | null;
    if (!d || d.ers !== 1) return;
    if (d.type === 'init' && d.reducedMotion === true) document.documentElement.classList.add('ers-reduced-motion');
  });
  // Ссылки на станцию: станция сама откроет книгу или каталог, iframe остаётся модулем.
  document.addEventListener(
    'click',
    (e) => {
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const route = stationRoute(a.href);
      if (!route) return;
      e.preventDefault();
      post('navigate', { route });
    },
    true,
  );
  post('ready');
}
