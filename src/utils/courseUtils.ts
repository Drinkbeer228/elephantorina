import { Course, Lesson, Module, Step, UserProgress } from '../types/course';

export type MarkdownBlock =
  | { type: 'heading'; level: 2 | 3 | 4; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'code'; content: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | {
      type: 'callout';
      tag: string;
      title: string;
      variant: 'clinical' | 'paleo' | 'behavior' | 'enrichment' | 'bio';
      lines: string[];
    };

const CALLOUT_MAP: Record<
  string,
  { title: string; variant: 'clinical' | 'paleo' | 'behavior' | 'enrichment' | 'bio' }
> = {
  'CLINICAL GUIDANCE': {
    title: 'Клинический регламент и ветеринарный протокол',
    variant: 'clinical',
  },
  'CLINICAL GUIDANCE / CONSERVATION': {
    title: 'Клинико-природоохранный регламент CITES',
    variant: 'clinical',
  },
  'PALEONTOLOGICAL GUIDANCE': {
    title: 'Палеонтологический диагностический ключ',
    variant: 'paleo',
  },
  'BIO NOTE': {
    title: 'Биологическая и анатомическая справка',
    variant: 'bio',
  },
  'BEHAVIOR CUE': {
    title: 'Этологический маркер и язык тела',
    variant: 'behavior',
  },
  'ENRICHMENT IDEA': {
    title: 'Проектирование среды и когнитивная нагрузка',
    variant: 'enrichment',
  },
};

/**
 * Formats LaTeX-style expressions and inline markdown (**bold**, *italic*, $math$)
 * into clean, accessible HTML strings.
 */
export function formatInlineHtml(input: string): string {
  if (typeof input !== 'string' || !input) return '';

  // Format $...$ blocks first
  const withMath = input.replace(/\$([^$]+)\$/g, (_, rawMath: string) => {
    const trimmed = rawMath.trim();
    // Check if it's a Latin binomial name like Loxodonta\ africana or Elephas\ maximus
    if (/^[A-Z][a-z]+(\\\s+|\s+)[a-z]+$/.test(trimmed)) {
      const cleanTaxon = trimmed.replace(/\\\s+/g, ' ');
      return `<em class="font-display italic text-[1.06em] text-[#1E4631] font-semibold">${cleanTaxon}</em>`;
    }

    // Otherwise clean LaTeX operators into readable scientific symbols
    const cleaned = trimmed
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
      .replace(/\\times/g, '×')
      .replace(/\\pm/g, '±')
      .replace(/\\approx/g, '≈')
      .replace(/\\delta/g, 'δ')
      .replace(/\\ge/g, '≥')
      .replace(/\\le/g, '≤')
      .replace(/\\\s+/g, ' ')
      .replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>')
      .replace(/\^([0-9+-]+)/g, '<sup>$1</sup>')
      .replace(/_\{([^}]+)\}/g, '<sub>$1</sub>')
      .replace(/_([0-9a-zA-Z]+)/g, '<sub>$1</sub>');

    return `<code class="px-1.5 py-0.5 bg-[#F3EFE6] border border-[#E4DFD3] rounded text-[0.86em] font-mono-code text-[#1E4631] font-medium">${cleaned}</code>`;
  });

  return withMath
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[#181A18]">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="font-display italic text-[1.05em] text-[#1E4631]">$1</em>');
}

/**
 * Parses markdown text into structured semantic blocks including tables,
 * ordered/unordered lists, code/ASCII diagrams, and callout boxes.
 */
export function parseMarkdownBlocks(rawText: string): MarkdownBlock[] {
  if (typeof rawText !== 'string' || !rawText.trim()) return [];

  const lines = rawText.split('\n');
  const blocks: MarkdownBlock[] = [];

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i] ?? '';
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Fenced code / ASCII diagram block
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      blocks.push({
        type: 'code',
        content: codeLines.join('\n'),
      });
      continue;
    }

    // 2. Indented ASCII diagram block (4+ spaces with box-drawing characters)
    if (/^\s{4,}.*[─│▼►◄▲]/.test(rawLine)) {
      const diagramLines: string[] = [];
      while (
        i < lines.length &&
        (lines[i].trim() === '' || /^\s{4,}/.test(lines[i]) || /[─│▼►◄▲]/.test(lines[i]))
      ) {
        if (lines[i].trim() === '' && diagramLines.length > 0 && !/[─│▼►◄▲]/.test(lines[i + 1] ?? '')) {
          break;
        }
        diagramLines.push(lines[i].replace(/^\s{4}/, ''));
        i++;
      }
      blocks.push({
        type: 'code',
        content: diagramLines.join('\n').trim(),
      });
      continue;
    }

    // 3. Callout block: [CLINICAL GUIDANCE], [PALEONTOLOGICAL GUIDANCE], etc.
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const tag = trimmed.slice(1, -1).trim();
      const calloutMeta = CALLOUT_MAP[tag];
      if (calloutMeta) {
        const calloutLines: string[] = [];
        i++;
        while (i < lines.length) {
          const nextTrim = lines[i].trim();
          if (nextTrim.startsWith('### ') || nextTrim.startsWith('## ')) break;
          if (nextTrim.startsWith('[') && nextTrim.endsWith(']') && CALLOUT_MAP[nextTrim.slice(1, -1)]) {
            break;
          }
          if (nextTrim !== '') {
            calloutLines.push(nextTrim);
          }
          i++;
        }
        blocks.push({
          type: 'callout',
          tag,
          title: calloutMeta.title,
          variant: calloutMeta.variant,
          lines: calloutLines,
        });
        continue;
      }
    }

    // 4. Headings (####, ###, ##)
    if (trimmed.startsWith('#### ')) {
      blocks.push({ type: 'heading', level: 4, text: trimmed.slice(5).trim() });
      i++;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'heading', level: 3, text: trimmed.slice(4).trim() });
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'heading', level: 2, text: trimmed.slice(3).trim() });
      i++;
      continue;
    }

    // 5. Markdown Table: | Header 1 | Header 2 |
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const parseRow = (rowStr: string) =>
          rowStr
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map((cell) => cell.trim());

        const headers = parseRow(tableLines[0]);
        const dataLines = tableLines.slice(1).filter((line) => !/^\|?[\s:|-]+\|?$/.test(line));
        const rows = dataLines.map(parseRow);
        blocks.push({ type: 'table', headers, rows });
        continue;
      }
    }

    // 6. Unordered List (* or -)
    if (/^[*-]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length) {
        const lineTrim = lines[i].trim();
        if (/^[*-]\s+/.test(lineTrim)) {
          items.push(lineTrim.replace(/^[*-]\s+/, ''));
          i++;
        } else if (/^\d+\.\s+/.test(lineTrim) && /^\s{2,}/.test(lines[i])) {
          // nested numbered item inside bullet list
          items.push(lineTrim);
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: 'list', ordered: false, items });
      continue;
    }

    // 7. Ordered List (1. , 2. , etc.)
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length) {
        const lineTrim = lines[i].trim();
        if (/^\d+\.\s+/.test(lineTrim)) {
          items.push(lineTrim.replace(/^\d+\.\s+/, ''));
          i++;
        } else if (/^[*-]\s+/.test(lineTrim) && /^\s{2,}/.test(lines[i])) {
          // nested bullet inside ordered list
          const subText = lineTrim.replace(/^[*-]\s+/, '');
          if (items.length > 0) {
            items[items.length - 1] += `<br/><span class="inline-block mt-1 pl-3 text-[#5C615D]">• ${subText}</span>`;
          } else {
            items.push(subText);
          }
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: 'list', ordered: true, items });
      continue;
    }

    // 8. Standard Paragraph
    blocks.push({ type: 'paragraph', text: trimmed });
    i++;
  }

  return blocks;
}

export interface LessonContext {
  currentModule: Module;
  currentLesson: Lesson;
  lessonSteps: Step[];
  lessonStepIndex: number;
  courseSteps: Step[];
  courseStepIndex: number;
  lessonNumber: string;
  cleanLessonTitle: string;
  prevStep: Step | null;
  nextStep: Step | null;
  isLastInLesson: boolean;
  isLastInCourse: boolean;
}

export function getLessonContext(course: Course, currentStepId: string): LessonContext {
  const courseSteps = course.modules.flatMap((m) => m.lessons.flatMap((l) => l.steps));
  const activeStep = courseSteps.find((s) => s.id === currentStepId) || courseSteps[0];
  const courseStepIndex = Math.max(
    0,
    courseSteps.findIndex((s) => s.id === activeStep?.id)
  );

  let foundModule = course.modules[0];
  let foundLesson = course.modules[0].lessons[0];

  for (const mod of course.modules) {
    for (const les of mod.lessons) {
      if (les.steps.some((s) => s.id === activeStep?.id)) {
        foundModule = mod;
        foundLesson = les;
        break;
      }
    }
  }

  const lessonSteps = foundLesson.steps;
  const lessonStepIndex = Math.max(
    0,
    lessonSteps.findIndex((s) => s.id === activeStep?.id)
  );

  const matchNum = foundLesson.title.match(/Урок\s+([\d.]+)/i);
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const globalLessonIdx = allLessons.findIndex((l) => l.id === foundLesson.id);
  const lessonNumber = matchNum ? matchNum[1] : String(globalLessonIdx + 1);

  const colonIdx = foundLesson.title.indexOf(':');
  const cleanLessonTitle =
    colonIdx > -1 && /^урок/i.test(foundLesson.title)
      ? foundLesson.title.slice(colonIdx + 1).trim()
      : foundLesson.title;

  const prevStep = courseStepIndex > 0 ? courseSteps[courseStepIndex - 1] : null;
  const nextStep =
    courseStepIndex < courseSteps.length - 1 ? courseSteps[courseStepIndex + 1] : null;

  return {
    currentModule: foundModule,
    currentLesson: foundLesson,
    lessonSteps,
    lessonStepIndex,
    courseSteps,
    courseStepIndex,
    lessonNumber,
    cleanLessonTitle,
    prevStep,
    nextStep,
    isLastInLesson: lessonStepIndex === lessonSteps.length - 1,
    isLastInCourse: courseStepIndex === courseSteps.length - 1,
  };
}

export interface BookmarkedStepEntry {
  courseId: string;
  courseTitle: string;
  moduleId: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
  step: Step;
}

export interface GlobalAcademicStats {
  totalTracks: number;
  totalModules: number;
  totalLessons: number;
  totalSteps: number;
  completedStepsCount: number;
  overallPercent: number;
  totalScore: number;
  bookmarksCount: number;
  bookmarkedEntries: BookmarkedStepEntry[];
}

export function computeGlobalStats(
  courses: Course[],
  progressStore: Record<string, UserProgress>
): GlobalAcademicStats {
  let totalModules = 0;
  let totalLessons = 0;
  let totalSteps = 0;
  let completedStepsCount = 0;
  let totalScore = 0;
  const bookmarkedEntries: BookmarkedStepEntry[] = [];

  for (const course of courses) {
    const prog = progressStore[course.id];
    const completedSet = new Set(prog?.completedSteps || []);
    const bookmarkSet = new Set(prog?.bookmarks || []);
    totalScore += prog?.score || 0;

    totalModules += course.modules.length;
    for (const mod of course.modules) {
      totalLessons += mod.lessons.length;
      for (const lesson of mod.lessons) {
        totalSteps += lesson.steps.length;
        for (const step of lesson.steps) {
          if (completedSet.has(step.id)) {
            completedStepsCount++;
          }
          if (bookmarkSet.has(step.id)) {
            bookmarkedEntries.push({
              courseId: course.id,
              courseTitle: course.title,
              moduleId: mod.id,
              moduleTitle: mod.title,
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              step,
            });
          }
        }
      }
    }
  }

  const overallPercent =
    totalSteps > 0 ? Math.round((completedStepsCount / totalSteps) * 100) : 0;

  return {
    totalTracks: courses.length,
    totalModules,
    totalLessons,
    totalSteps,
    completedStepsCount,
    overallPercent,
    totalScore,
    bookmarksCount: bookmarkedEntries.length,
    bookmarkedEntries,
  };
}

/**
 * Pure biomechanical calculation for the interactive Digital Cushion & Plantar Pressure simulator
 */
export function calculatePlantarBiomechanics(bodyMassKg: number, strideFactor: number) {
  const clampedMass = Math.max(1000, Math.min(7000, bodyMassKg));
  const clampedFactor = Math.max(1.0, Math.min(2.2, strideFactor));

  // Cushion expansion increases from 18% at rest to 32% under dynamic stride
  const cushionExpansionPercent = Math.round(
    16 + ((clampedMass - 1000) / 6000) * 8 + (clampedFactor - 1.0) * 7
  );

  // Peak plantar pressure in kPa (normal range 140 - 260 kPa due to digital cushion dissipation)
  const peakPressureKpa = Math.round(
    (clampedMass / 42) * clampedFactor * (1 - cushionExpansionPercent / 120)
  );

  // Venous pump return volume per step in mL
  const venousReturnMl = Math.round(180 + (clampedMass / 1000) * 65 * clampedFactor);

  const status: 'NOMINAL' | 'ELEVATED' | 'CRITICAL' =
    peakPressureKpa > 245 ? 'CRITICAL' : peakPressureKpa > 195 ? 'ELEVATED' : 'NOMINAL';

  return {
    cushionExpansionPercent,
    peakPressureKpa,
    venousReturnMl,
    status,
  };
}

/**
 * Pure clinical evaluation for the interactive EEHV Viremia & Hematology simulator
 */
export function evaluateEehvClinicalProtocol(viralLoadLog10: number, plateletsGigaPerL: number) {
  // viralLoadLog10 is exponent (e.g. 2 = 10^2, 3 = 10^3, 5 = 10^5 copies/uL)
  const isUrgentViremia = viralLoadLog10 >= 3;
  const isCriticalThrombocytopenia = plateletsGigaPerL < 50;
  const isProdromalDrop = plateletsGigaPerL < 100;

  if (viralLoadLog10 >= 4 || plateletsGigaPerL < 50) {
    return {
      severity: 'CRITICAL' as const,
      label: 'КРИТИЧЕСКАЯ ФАЗА ДВС / КАПИЛЛЯРНОЙ УТЕЧКИ',
      protocol:
        'Немедленное введение Фамцикловира (15 мг/кг PO или 10 мг/кг ректально TID) + трансфузия гипериммунной плазмы и инфузионная поддержка.',
      survivalEstimate: '35–65% при старте в течение ≤6 часов',
    };
  }

  if (isUrgentViremia || isProdromalDrop) {
    return {
      severity: 'URGENT' as const,
      label: 'ПРОДРОМАЛЬНОЕ ТЕРАПЕВТИЧЕСКОЕ ОКНО',
      protocol:
        'Немедленный старт этиотропной терапии Фамцикловиром (порог qPCR ≥ 10³ копий/мкл достигнут) и ежедневный мониторинг моноцитов и тромбоцитов.',
      survivalEstimate: '70–85% при раннем старте в скрытой фазе',
    };
  }

  return {
    severity: 'NOMINAL' as const,
    label: 'ЛАТЕНТНЫЙ / БЕЗОПАСНЫЙ ПРОФИЛЬ',
    protocol:
      'Плановый еженедельный гематологический и qPCR-скрининг из краевой ушной вены (v. auricularis posterior). Противовирусная терапия не требуется.',
    survivalEstimate: '>98% (физиологическая норма)',
  };
}
