import test from 'node:test';
import assert from 'node:assert/strict';
import type { Question } from '../bank/types';
import { createSession, pick, goTo, summarize, grade, PASS_PERCENT } from './session';

const choice = (id: string, answer = 0): Question => ({
  kind: 'choice', id, prompt: id, options: ['a', 'b', 'c', 'd'], answer, explanation: 'why',
  optionNotes: [undefined, 'not b', 'not c', 'not d'],
});
const kase: Question = {
  kind: 'case', id: 'case', title: 't', situation: 's',
  options: [{ text: 'bad', correct: false, feedback: 'fb-bad' }, { text: 'good', correct: true, feedback: 'fb-good' }],
};

test('session size is capped by the pool and by size', () => {
  const pool = Array.from({ length: 20 }, (_, i) => choice('q' + i));
  assert.equal(createSession(pool, { mode: 'practice', seed: 1 }).items.length, 12);
  assert.equal(createSession(pool, { mode: 'practice', seed: 1, size: 5 }).items.length, 5);
  assert.equal(createSession(pool.slice(0, 3), { mode: 'practice', seed: 1 }).items.length, 3);
});

test('weak questions are always included', () => {
  const pool = Array.from({ length: 30 }, (_, i) => choice('q' + i));
  const weak = new Set(['q25', 'q29']);
  for (let seed = 1; seed < 20; seed++) {
    const ids = createSession(pool, { mode: 'exam', seed, size: 5, weak }).items.map((i) => i.question.id);
    assert.ok(ids.includes('q25') && ids.includes('q29'));
  }
});

test('shuffled options still grade against the original answer', () => {
  const s0 = createSession([choice('x', 2)], { mode: 'practice', seed: 7 });
  const shown = s0.items[0]!.order.indexOf(2);
  const right = summarize(pick(s0, shown));
  assert.equal(right.correct, 1);
  assert.equal(right.percent, 100);
  const wrongIdx = shown === 0 ? 1 : 0;
  const wrong = grade(pick(s0, wrongIdx).items[0]!);
  assert.equal(wrong.correct, false);
  assert.equal(wrong.correctText, 'c');
  assert.match(wrong.note, /^not /);
});

test('practice locks the first answer, exam allows changing it', () => {
  const p = createSession([choice('x')], { mode: 'practice', seed: 3 });
  assert.equal(pick(pick(p, 0), 1).items[0]!.picked, 0);
  const e = createSession([choice('x')], { mode: 'exam', seed: 3 });
  assert.equal(pick(pick(e, 0), 1).items[0]!.picked, 1);
});

test('case questions use the feedback of the chosen option', () => {
  const s = createSession([kase], { mode: 'exam', seed: 2 });
  const bad = s.items[0]!.order.indexOf(0);
  assert.equal(grade(pick(s, bad).items[0]!).note, 'fb-bad');
});

test('summary: unanswered count as wrong, pass threshold applies', () => {
  const pool = Array.from({ length: 5 }, (_, i) => choice('q' + i, 0));
  let s = createSession(pool, { mode: 'exam', seed: 9 });
  for (let i = 0; i < 4; i++) s = pick(goTo(s, i), s.items[i]!.order.indexOf(0));
  const sum = summarize(s);
  assert.equal(sum.correct, 4);
  assert.equal(sum.percent, 80);
  assert.equal(sum.passed, 80 >= PASS_PERCENT);
  assert.equal(sum.graded.filter((g) => g.pickedText === null).length, 1);
});
