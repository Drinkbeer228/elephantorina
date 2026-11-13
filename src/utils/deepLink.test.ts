import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessonTarget, withoutLessonParams } from './deepLink';
import { COURSES_DATA } from '../data/coursesData';

test('a known course and lesson resolve to the first step of the lesson', () => {
  const t = lessonTarget('?course=track-4-evolution&lesson=lesson-3-18-1', COURSES_DATA);
  const lesson = COURSES_DATA.find((c) => c.id === 'track-4-evolution')!
    .modules.flatMap((m) => m.lessons).find((l) => l.id === 'lesson-3-18-1')!;
  assert.deepEqual(t, { courseId: 'track-4-evolution', stepId: lesson.steps[0]!.id });
});

test('unknown or missing ids give null', () => {
  assert.equal(lessonTarget('?course=track-anatomy&lesson=les-trunk', COURSES_DATA), null);
  assert.equal(lessonTarget('?course=track-4-evolution&lesson=nope', COURSES_DATA), null);
  assert.equal(lessonTarget('?course=track-4-evolution', COURSES_DATA), null);
  assert.equal(lessonTarget('', COURSES_DATA), null);
});

test('the link parameters are removed, others are kept', () => {
  assert.equal(
    withoutLessonParams('https://x.io/elephantorina/?course=a&lesson=b&utm=1#top'),
    '/elephantorina/?utm=1#top',
  );
});
