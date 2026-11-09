import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAcademicRank,
  formatModuleHeader,
  formatLessonTitle,
  findTargetLessonId,
  percent,
} from './progress';
import type { Course, UserProgress } from '../types/course';

test('getAcademicRank returns correct shortTitle and full title across progress tiers', () => {
  const rank0 = getAcademicRank(0);
  assert.equal(rank0.code, 'RANK_1');
  assert.equal(rank0.shortTitle, 'Младший лаборант');

  const rank50 = getAcademicRank(50);
  assert.equal(rank50.code, 'RANK_4');
  assert.equal(rank50.shortTitle, 'Магистр этологии');

  const rank100 = getAcademicRank(100);
  assert.equal(rank100.code, 'RANK_7');
  assert.equal(rank100.shortTitle, 'Академик Совета');
});

test('formatModuleHeader extracts module code and clean title', () => {
  const mod = formatModuleHeader('Модуль 0: Эволюционная палеонтология и систематика', 0);
  assert.equal(mod.code, 'М0');
  assert.equal(mod.name, 'Эволюционная палеонтология и систематика');

  const fallback = formatModuleHeader('Клиническая диагностика', 2);
  assert.equal(fallback.code, 'М2');
  assert.equal(fallback.name, 'Клиническая диагностика');
});

test('formatLessonTitle extracts lesson number and preserves full scientific title without truncation', () => {
  const lesson = formatLessonTitle(
    'Урок 0.1: Ранние хоботные (Eritherium, Phosphatherium) и палеогеновая радиация',
    '1.1'
  );
  assert.equal(lesson.code, '0.1');
  assert.equal(
    lesson.title,
    'Ранние хоботные (Eritherium, Phosphatherium) и палеогеновая радиация'
  );
});

test('findTargetLessonId highlights active incomplete lesson or falls back to first incomplete lesson', () => {
  const mockCourse: Course = {
    id: 'course-1',
    title: 'Трек 1: Анатомия',
    description: 'Описание',
    icon: '🐘',
    modules: [
      {
        id: 'mod-0',
        title: 'Модуль 0: Введение',
        lessons: [
          {
            id: 'lesson-1',
            title: 'Урок 0.1: Первый урок',
            steps: [{ id: 's1', type: 'THEORY', title: 'Шаг 1', content: '...' }],
          },
          {
            id: 'lesson-2',
            title: 'Урок 0.2: Второй урок',
            steps: [{ id: 's2', type: 'THEORY', title: 'Шаг 2', content: '...' }],
          },
        ],
      },
    ],
  };

  assert.equal(findTargetLessonId(mockCourse, undefined), 'lesson-1');

  const progressWithS1Done: UserProgress = {
    courseId: 'course-1',
    completedSteps: ['s1'],
    currentStepId: 's1',
    score: 10,
    bookmarks: [],
    quizAnswers: {},
    scenarioAnswers: {},
    startedAt: '',
    lastActivity: '',
  };
  assert.equal(findTargetLessonId(mockCourse, progressWithS1Done), 'lesson-2');
});

test('percent computes rounded percentage safely', () => {
  assert.equal(percent(0, 0), 0);
  assert.equal(percent(1, 4), 25);
  assert.equal(percent(4, 4), 100);
});
