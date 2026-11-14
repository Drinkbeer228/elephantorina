/**
 * Маршруты в hash, чтобы GitHub Pages не требовал 404-обходов.
 * Входящие ссылки из библиотеки: `?book=<id>`; старые ссылки на уроки: `?course=&lesson=`.
 */
import { useEffect, useState } from 'react';

export type Mode = 'practice' | 'exam';

export type Route =
  | { kind: 'home' }
  | { kind: 'book'; id: string }
  | { kind: 'terms'; id: string }
  | { kind: 'test'; scope: 'book'; id: string; mode: Mode }
  | { kind: 'test'; scope: 'mix'; discipline: string | null; mode: Mode }
  | { kind: 'test'; scope: 'mistakes'; mode: Mode }
  | { kind: 'list' };

const BOOK_ID = /^[a-z]+\/[a-z0-9-]+$/;

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '') || '/';
  const [path = '/', query = ''] = raw.split('?');
  const params = new URLSearchParams(query);
  const mode: Mode = params.get('mode') === 'exam' ? 'exam' : 'practice';
  const seg = path.split('/').filter(Boolean);
  const rest = (from: number) => seg.slice(from).join('/');

  if (seg[0] === 'book' && BOOK_ID.test(rest(1))) return { kind: 'book', id: rest(1) };
  if (seg[0] === 'terms' && BOOK_ID.test(rest(1))) return { kind: 'terms', id: rest(1) };
  if (seg[0] === 'test' && seg[1] === 'book' && BOOK_ID.test(rest(2))) return { kind: 'test', scope: 'book', id: rest(2), mode };
  if (seg[0] === 'test' && seg[1] === 'mix') return { kind: 'test', scope: 'mix', discipline: params.get('d'), mode };
  if (seg[0] === 'test' && seg[1] === 'mistakes') return { kind: 'test', scope: 'mistakes', mode };
  if (seg[0] === 'list') return { kind: 'list' };
  return { kind: 'home' };
}

export function href(r: Route): string {
  switch (r.kind) {
    case 'home':
      return '#/';
    case 'book':
      return `#/book/${r.id}`;
    case 'terms':
      return `#/terms/${r.id}`;
    case 'list':
      return '#/list';
    case 'test': {
      const m = r.mode === 'exam' ? 'mode=exam' : '';
      if (r.scope === 'book') return `#/test/book/${r.id}${m ? '?' + m : ''}`;
      if (r.scope === 'mistakes') return `#/test/mistakes${m ? '?' + m : ''}`;
      const q = [r.discipline ? `d=${encodeURIComponent(r.discipline)}` : '', m].filter(Boolean).join('&');
      return `#/test/mix${q ? '?' + q : ''}`;
    }
  }
}

/**
 * Разбирает входящие параметры поиска. Возвращает hash, на который нужно перейти, или null.
 * `lessonToBook` переводит старый id урока в книгу.
 */
export function incomingHash(search: string, lessonToBook: (lesson: string | null) => string | null): string | null {
  const p = new URLSearchParams(search);
  const book = p.get('book');
  if (book && BOOK_ID.test(book)) return href({ kind: 'book', id: book });
  const legacy = lessonToBook(p.get('lesson'));
  if (legacy) return href({ kind: 'book', id: legacy });
  if (p.has('book') || p.has('lesson') || p.has('course')) return href({ kind: 'home' });
  return null;
}

export function navigate(r: Route): void {
  window.location.hash = href(r);
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const on = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}
