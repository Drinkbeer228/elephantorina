import test from 'node:test';
import assert from 'node:assert/strict';
import type { Question } from '../bank/types';
import { createSession, pick, summarize } from './session';
import { emptyProgress, mistakes, parseProgress, recordSummary, topicStatus } from './progress';

const q = (id: string): Question => ({ kind: 'choice', id, prompt: id, options: ['ok', 'no'], answer: 0, explanation: '' });

function run(ids: string[], correct: Set<string>) {
  let s = createSession(ids.map(q), { mode: 'exam', seed: 1 });
  s.items.forEach((it, i) => {
    s = pick({ ...s, index: i }, it.order.indexOf(correct.has(it.question.id) ? 0 : 1));
  });
  return summarize(s);
}

test('records mistakes and clears them when answered right', () => {
  let p = recordSummary(emptyProgress(), run(['a', 'b'], new Set(['a'])), 'anatomy/x');
  assert.deepEqual([...mistakes(p)], ['b']);
  p = recordSummary(p, run(['b'], new Set(['b'])), null);
  assert.equal(mistakes(p).size, 0);
  assert.equal(p.questions.b!.n, 2);
});

test('topic keeps best result and passed flag', () => {
  let p = recordSummary(emptyProgress(), run(['a', 'b'], new Set(['a', 'b'])), 'anatomy/x');
  assert.equal(topicStatus(p, 'anatomy/x'), 'passed');
  p = recordSummary(p, run(['a', 'b'], new Set()), 'anatomy/x');
  assert.equal(p.topics['anatomy/x']!.best, 100);
  assert.equal(p.topics['anatomy/x']!.last, 0);
  assert.equal(topicStatus(p, 'anatomy/x'), 'passed');
  assert.equal(topicStatus(p, 'anatomy/y'), 'new');
});

test('corrupt storage starts fresh', () => {
  assert.deepEqual(parseProgress('{oops'), emptyProgress());
  assert.deepEqual(parseProgress('[1,2]'), emptyProgress());
});
