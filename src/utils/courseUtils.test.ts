import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseMarkdownBlocks,
  formatInlineHtml,
  getLessonContext,
  computeGlobalStats,
  calculatePlantarBiomechanics,
  evaluateEehvClinicalProtocol,
} from './courseUtils';
import { COURSES_DATA } from '../data/coursesData';

test('parseMarkdownBlocks parses headings, tables, lists, code, and callouts accurately', () => {
  const sample = `
### Заголовок раздела
Обычный параграф с $Loxodonta\\ africana$ и **жирным** текстом.

* Первый пункт
* Второй пункт

| Вид | Масса |
| :--- | :--- |
| Саванный слон | 6000 кг |
| Лесной слон | 3000 кг |

\`\`\`
Схема A ──► Схема B
\`\`\`

[CLINICAL GUIDANCE]
**Важное правило:**
Контроль температуры диска.
`;

  const blocks = parseMarkdownBlocks(sample);
  assert.equal(blocks.length, 6);
  assert.equal(blocks[0].type, 'heading');
  assert.equal(blocks[1].type, 'paragraph');
  assert.equal(blocks[2].type, 'list');
  assert.equal(blocks[3].type, 'table');
  if (blocks[3].type === 'table') {
    assert.deepEqual(blocks[3].headers, ['Вид', 'Масса']);
    assert.equal(blocks[3].rows.length, 2);
  }
  assert.equal(blocks[4].type, 'code');
  assert.equal(blocks[5].type, 'callout');
});

test('formatInlineHtml formats binomial Latin names and mathematical formulas cleanly', () => {
  const taxonFormatted = formatInlineHtml('Вид $Loxodonta\\ africana$ обитает в саванне');
  assert.ok(taxonFormatted.includes('Loxodonta africana'));
  assert.ok(!taxonFormatted.includes('\\'));

  const mathFormatted = formatInlineHtml('Изотопный профиль $\\delta^{18}O$ и $7 \\pm 2$');
  assert.ok(mathFormatted.includes('δ<sup>18</sup>O'));
  assert.ok(mathFormatted.includes('7 ± 2'));
});

test('getLessonContext resolves current lesson steps and navigation boundaries', () => {
  const firstCourse = COURSES_DATA[0];
  const ctx = getLessonContext(firstCourse, 'step-0-1-1');
  assert.equal(ctx.currentLesson.id, 'lesson-0-1');
  assert.equal(ctx.lessonSteps.length, 2);
  assert.equal(ctx.lessonStepIndex, 0);
  assert.equal(ctx.prevStep, null);
  assert.equal(ctx.nextStep?.id, 'step-0-1-2');
});

test('computeGlobalStats aggregates all 8 tracks and bookmarks accurately', () => {
  const stats = computeGlobalStats(COURSES_DATA, {
    'track-1-anatomy': {
      courseId: 'track-1-anatomy',
      completedSteps: ['step-0-1-1', 'step-0-1-2'],
      currentStepId: 'step-0-1-2',
      score: 20,
      bookmarks: ['step-0-1-1'],
      quizAnswers: {},
      scenarioAnswers: {},
      startedAt: '',
      lastActivity: '',
    },
  });

  assert.equal(stats.totalTracks, 8);
  assert.ok(stats.totalModules >= 30);
  assert.equal(stats.completedStepsCount, 2);
  assert.equal(stats.totalScore, 20);
  assert.equal(stats.bookmarksCount, 1);
  assert.equal(stats.bookmarkedEntries[0].step.id, 'step-0-1-1');
});

test('biomechanical and EEHV clinical simulation calculations return expected states', () => {
  const bioNominal = calculatePlantarBiomechanics(3500, 1.1);
  assert.equal(bioNominal.status, 'NOMINAL');
  assert.ok(bioNominal.peakPressureKpa > 50);

  const eehvUrgent = evaluateEehvClinicalProtocol(3.5, 90);
  assert.equal(eehvUrgent.severity, 'URGENT');

  const eehvCritical = evaluateEehvClinicalProtocol(5.0, 35);
  assert.equal(eehvCritical.severity, 'CRITICAL');
});
