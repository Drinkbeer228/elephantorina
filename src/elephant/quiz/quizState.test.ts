import test from 'node:test';
import assert from 'node:assert/strict';
import { initialQuizState, quizReducer } from './quizState';
import { getQuizRank, accuracyPercent } from './scoring';

test('quizReducer ignores a second answer for the same question', () => {
  let s = quizReducer(initialQuizState, { type: 'start', now: 1000 });
  s = quizReducer(s, { type: 'answer', questionId: 'a', optionIndex: 0, correct: true, points: 10 });
  const again = quizReducer(s, { type: 'answer', questionId: 'a', optionIndex: 1, correct: false, points: 0 });
  assert.equal(again, s);
  assert.equal(again.answers.length, 1);
});

test('quizReducer does not advance until an answer is chosen', () => {
  const s = quizReducer(initialQuizState, { type: 'start', now: 1000 });
  assert.equal(quizReducer(s, { type: 'next', now: 2000, total: 2 }), s);
});

test('quizReducer advances and finishes after the last question', () => {
  let s = quizReducer(initialQuizState, { type: 'start', now: 1000 });
  s = quizReducer(s, { type: 'answer', questionId: 'a', optionIndex: 0, correct: true, points: 10 });
  s = quizReducer(s, { type: 'next', now: 2000, total: 2 });
  assert.equal(s.index, 1);
  assert.equal(s.selected, null);
  s = quizReducer(s, { type: 'answer', questionId: 'b', optionIndex: 2, correct: false, points: 0 });
  s = quizReducer(s, { type: 'next', now: 3000, total: 2 });
  assert.equal(s.status, 'finished');
  assert.equal(s.finishedAt, 3000);
});

test('getQuizRank maps accuracy to the three ranks', () => {
  assert.equal(getQuizRank(100).code, 'master');
  assert.equal(getQuizRank(80).code, 'master');
  assert.equal(getQuizRank(79).code, 'specialist');
  assert.equal(getQuizRank(50).code, 'specialist');
  assert.equal(getQuizRank(49).code, 'novice');
  assert.equal(getQuizRank(0).title, 'Новичок');
});

test('accuracyPercent rounds and handles an empty quiz', () => {
  assert.equal(accuracyPercent(2, 3), 67);
  assert.equal(accuracyPercent(0, 0), 0);
});
