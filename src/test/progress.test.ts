import test from 'node:test';
import assert from 'node:assert/strict';
import type { Question } from '../bank/types';
import { createSession, pick, summarize } from './session';
import { emptyProgress, exportProgress, mergeProgress, mistakes, parseExport, parseProgress, recordSummary, topicStatus } from './progress';

const q = (id: string): Question => ({ kind: 'choice', id, prompt: id, options: ['ok', 'no'], answer: 0, explanation: '' });

function run(ids: string[], correct: Set<string>) {
  let s = createSession(ids.map(q), { mode: 'exam', seed: 1 });
  s.items.forEach((it, i) => {
    s = pick({ ...s, index: i }, it.order.indexOf(correct.has(it.question.id) ? 0 : 1));
  });
  return summarize(s);
}

test('records mistakes and clears them when answered right', () => {
  let p = recordSummary(emptyProgress(), run(['a', 'b'], new Set(['a'])), 'anatomy/x', 'practice');
  assert.deepEqual([...mistakes(p)], ['b']);
  p = recordSummary(p, run(['b'], new Set(['b'])), null, 'practice');
  assert.equal(mistakes(p).size, 0);
  assert.equal(p.questions.b!.n, 2);
});

test('only the exam mode marks a topic as passed', () => {
  const p = recordSummary(emptyProgress(), run(['a', 'b'], new Set(['a', 'b'])), 'anatomy/x', 'practice');
  assert.equal(topicStatus(p, 'anatomy/x'), 'started');
  assert.equal(p.topics['anatomy/x']!.passed, false);
  assert.equal(p.topics['anatomy/x']!.practiceLast, 100);
  assert.equal(p.topics['anatomy/x']!.attempts, 0);
});

test('topic keeps best exam result and passed flag', () => {
  let p = recordSummary(emptyProgress(), run(['a', 'b'], new Set(['a', 'b'])), 'anatomy/x', 'exam');
  assert.equal(topicStatus(p, 'anatomy/x'), 'passed');
  p = recordSummary(p, run(['a', 'b'], new Set()), 'anatomy/x', 'exam');
  assert.equal(p.topics['anatomy/x']!.best, 100);
  assert.equal(p.topics['anatomy/x']!.last, 0);
  assert.equal(topicStatus(p, 'anatomy/x'), 'passed');
  assert.equal(topicStatus(p, 'anatomy/y'), 'new');
});

test('corrupt storage starts fresh', () => {
  assert.deepEqual(parseProgress('{oops'), emptyProgress());
  assert.deepEqual(parseProgress('[1,2]'), emptyProgress());
});

test('export → import round-trips; foreign files are rejected', () => {
  const p = recordSummary(emptyProgress(), run(['a', 'b'], new Set(['a'])), 'anatomy/x', 'exam');
  assert.deepEqual(parseExport(exportProgress(p)), p);
  assert.throws(() => parseExport('{"app":"other","progress":{}}'), /не файл прогресса/);
  assert.throws(() => parseExport('nope'), /не JSON/);
});

test('merge keeps the later answer and any passed exam', () => {
  const a = recordSummary(emptyProgress(), run(['a', 'b'], new Set(['a', 'b'])), 'anatomy/x', 'exam', '2026-01-01T00:00:00Z');
  const b = recordSummary(emptyProgress(), run(['a', 'c'], new Set(['c'])), 'anatomy/x', 'exam', '2026-02-01T00:00:00Z');
  const m = mergeProgress(a, b);
  assert.equal(m.questions.a!.ok, false, 'later answer wins');
  assert.equal(m.questions.b!.ok, true);
  assert.equal(m.questions.c!.ok, true);
  assert.equal(m.topics['anatomy/x']!.passed, true);
  assert.equal(m.topics['anatomy/x']!.best, 100);
  assert.equal(m.topics['anatomy/x']!.last, 50);
  assert.deepEqual(mergeProgress(m, m), m, 'idempotent');
});
