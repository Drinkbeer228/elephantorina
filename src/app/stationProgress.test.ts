import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toStationSummary, writeStationSummary, STATION_PROGRESS_KEY } from './stationProgress';
import { emptyProgress } from '../test/progress';

test('пустой прогресс — пустая сводка в формате ers.progress/1', () => {
  const s = toStationSummary(emptyProgress(), '2026-11-14T00:00:00.000Z');
  assert.deepEqual(s, { schema: 'ers.progress/1', module: 'elephantorina', updatedAt: '2026-11-14T00:00:00.000Z', items: {} });
});

test('сданный зачёт — done с лучшим процентом; одна тренировка — started без балла; вопросов в сводке нет', () => {
  const p = emptyProgress();
  p.questions['q1'] = { ok: true, n: 1, at: '2026-11-10T00:00:00.000Z' };
  p.topics['anatomy/a'] = { best: 90, last: 80, attempts: 2, passed: true, at: '2026-11-12T00:00:00.000Z' };
  p.topics['ecology/b'] = { best: 0, last: 0, attempts: 0, passed: false, practiceLast: 50, at: '2026-11-13T00:00:00.000Z' };
  const s = toStationSummary(p);
  assert.equal(s.updatedAt, '2026-11-13T00:00:00.000Z');
  assert.deepEqual(s.items['anatomy/a'], { kind: 'quiz', status: 'done', at: '2026-11-12T00:00:00.000Z', score: 90, ref: { book: 'anatomy/a' } });
  assert.deepEqual(s.items['ecology/b'], { kind: 'quiz', status: 'started', at: '2026-11-13T00:00:00.000Z', ref: { book: 'ecology/b' } });
  assert.equal(Object.keys(s.items).length, 2);
});

test('запись идёт в свой ключ; отказ памяти не бросает', () => {
  const data = new Map<string, string>();
  writeStationSummary(emptyProgress(), { setItem: (k, v) => void data.set(k, v) });
  assert.equal(JSON.parse(data.get(STATION_PROGRESS_KEY)!).module, 'elephantorina');
  assert.doesNotThrow(() => writeStationSummary(emptyProgress(), { setItem: () => { throw new Error('quota'); } }));
});
