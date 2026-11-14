import test from 'node:test';
import assert from 'node:assert/strict';
import { href, incomingHash, parseHash, type Route } from './router';

test('routes round-trip', () => {
  const routes: Route[] = [
    { kind: 'home' },
    { kind: 'book', id: 'anatomy/muscular-hydrostat-and-trunk-biomechanics' },
    { kind: 'terms', id: 'ecology/ecosystem-breakdown-syndrome' },
    { kind: 'test', scope: 'book', id: 'ecology/ecosystem-breakdown-syndrome', mode: 'exam' },
    { kind: 'test', scope: 'mix', discipline: 'anatomy', mode: 'practice' },
    { kind: 'test', scope: 'mix', discipline: null, mode: 'exam' },
    { kind: 'test', scope: 'mistakes', mode: 'practice' },
    { kind: 'list' },
  ];
  for (const r of routes) assert.deepEqual(parseHash(href(r)), r);
});

test('garbage goes home', () => {
  assert.deepEqual(parseHash('#/book/../../etc'), { kind: 'home' });
  assert.deepEqual(parseHash(''), { kind: 'home' });
});

test('incoming links from the library', () => {
  const map = (l: string | null) => (l === 'lesson-3-18-1' ? 'anatomy/trunk' : null);
  assert.equal(incomingHash('?book=anatomy/muscular-hydrostat-and-trunk-biomechanics', map), '#/book/anatomy/muscular-hydrostat-and-trunk-biomechanics');
  assert.equal(incomingHash('?course=track-4-evolution&lesson=lesson-3-18-1', map), '#/book/anatomy/trunk');
  assert.equal(incomingHash('?course=x&lesson=unknown', map), '#/');
  assert.equal(incomingHash('', map), null);
});
