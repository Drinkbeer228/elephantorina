import type { Course, Step, UserProgress } from "../types/course";
export type { Step };

export type StepStatus = "idle" | "done" | "correct" | "wrong";

/** Grey = unattempted, green = correct/completed, red = mistake. */
export function getStepStatus(step: Step, progress: UserProgress | undefined): StepStatus {
  if (!progress) return "idle";
  if (step.type === "QUIZ") {
    const a = progress.quizAnswers?.[step.id];
    if (a === undefined) return progress.completedSteps.includes(step.id) ? "done" : "idle";
    return a === step.correctAnswer ? "correct" : "wrong";
  }
  if (step.type === "SCENARIO") {
    const id = progress.scenarioAnswers?.[step.id];
    if (id === undefined) return progress.completedSteps.includes(step.id) ? "done" : "idle";
    const opt = step.options.find((o) => o.id === id);
    return opt?.isCorrect ? "correct" : "wrong";
  }
  return progress.completedSteps.includes(step.id) ? "done" : "idle";
}

export interface MistakeEntry {
  courseId: string;
  courseTitle: string;
  step: Step;
}

export function collectMistakes(
  courses: Course[],
  store: Record<string, UserProgress | undefined>,
): MistakeEntry[] {
  const out: MistakeEntry[] = [];
  for (const c of courses) {
    const p = store[c.id];
    if (!p) continue;
    for (const m of c.modules)
      for (const l of m.lessons)
        for (const s of l.steps)
          if (getStepStatus(s, p) === "wrong") out.push({ courseId: c.id, courseTitle: c.title, step: s });
  }
  return out;
}

export function stepsOf(course: Course): Step[] {
  return course.modules.flatMap((m) => m.lessons.flatMap((l) => l.steps));
}

export function percent(done: number, total: number) {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export interface AcademicRank {
  code: string;
  min: number;
  max: number;
  title: string;
  shortTitle: string;
  motto: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeIcon: string;
  category: 'clinical' | 'genetics' | 'ethology' | 'paleontology' | 'mastery';
  conditionText: string;
}

export const ACADEMIC_RANKS: AcademicRank[] = [
  { min: 0,  max: 12, code: 'RANK_1', shortTitle: 'Младший лаборант', title: 'Младший лаборант подиатрических наблюдений', motto: 'Допущен к визуальному осмотру следов на песчаном субстрате. К ортопедическому ножу и фрезе ближе чем на 5 метров не подпускать!' },
  { min: 13, max: 28, code: 'RANK_2', shortTitle: 'Стажёр локации', title: 'Стажёр акустической и сейсмической локации', motto: 'Различает трубит и низкочастотный рокот. Умеет регистрировать трипедальную позу, но пока путает волны Рэлея с вибрацией трактора.' },
  { min: 29, max: 48, code: 'RANK_3', shortTitle: 'Ассистент кафедры', title: 'Ассистент кафедры ветеринарной неонатологии и EEHV-скрининга', motto: 'Уверенно берет кровь из краевой ушной вены (v. auricularis posterior) для ПЦР-анализа. Допущен к расчёту индекса PIKE под присмотром старшего специалиста.' },
  { min: 49, max: 67, code: 'RANK_4', shortTitle: 'Магистр этологии', title: 'Магистр этологии и регуляции мустовых состояний', motto: 'Безошибочно оценивает статус TGS по шкале Пула и работает исключительно в системе Protected Contact. Знает, почему быку в мусте нельзя смотреть прямо в глаза.' },
  { min: 68, max: 84, code: 'RANK_5', shortTitle: 'Доцент онкогенетики', title: 'Доцент молекулярной онкогенетики и палеобиохимии', motto: 'Свободно апеллирует 20 копиями гена TP53 и "зомби-геном" LIF6. Способен провести ZooMS-анализ коллагена I типа на образце возрастом 3 миллиона лет.' },
  { min: 85, max: 95, code: 'RANK_6', shortTitle: 'Профессор хирургии', title: 'Профессор подиатрической хирургии и метапопуляционной инженерии', motto: 'Выполняет воронкообразное дренирование подошвенных абсцессов с сохранением 15–22 мм защитного рога. Проектирует миграционные коридоры по алгоритмам Least-Cost Path.' },
  { min: 96, max: 100, code: 'RANK_7', shortTitle: 'Академик Совета', title: 'Академик Высшего Совета Элефантологии (Dr. of Science in Proboscidea)', motto: 'Абсолютный научный авторитет. По запаху секрета височных желез и структуре ламелл M3 способен реконструировать филогенетическое древо от Eritherium до Loxodonta и Elephas.' }
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'ach-1', title: 'Без единого перегрева', badgeIcon: '🦶', category: 'clinical', description: 'Сохранение рога 15–22 мм и отказ от углошлифмашин (>42°C).', conditionText: 'Идеальное прохождение протокола подиатрии.' },
  { id: 'ach-2', title: 'Глаз-qPCR', badgeIcon: '🔬', category: 'clinical', description: 'Детекция виремии EEHV при нагрузке ≥10³ копий/мкл в продроме.', conditionText: 'Верная ранняя диагностика герпесвируса.' },
  { id: 'ach-3', title: 'Сейсмический локатор', badgeIcon: '📡', category: 'ethology', description: '100% верных ответов по тельцам Пачини и волнам Рэлея.', conditionText: 'Точное знание инфразвуковой триангуляции.' },
  { id: 'ach-4', title: 'Укротитель муста', badgeIcon: '🐘', category: 'ethology', description: 'Оценка TGS по Пулу и регламент Protected Contact без анкуса.', conditionText: 'Безупречное ведение мустующего быка.' },
  { id: 'ach-5', title: 'Геномный щит Пето', badgeIcon: '🧬', category: 'genetics', description: 'Разрешение парадокса Пето: 20 копий TP53 и апоптоз через LIF6.', conditionText: '100% результат в модуле онкогенетики.' },
  { id: 'ach-6', title: 'Криминалист CITES', badgeIcon: '⚖️', category: 'mastery', description: 'Расчет популяционного баланса PIKE > 0.50 и SCAT-генотипирование.', conditionText: 'Экспертиза нелегального оборота слоновой кости.' },
  { id: 'ach-7', title: 'Палеопротеомик 4.0', badgeIcon: '🦴', category: 'paleontology', description: 'Видовая атрибуция кости по ZooMS-масс-спектрометрии коллагена I.', conditionText: 'Успешная палеомолекулярная идентификация.' },
  { id: 'ach-8', title: 'Молниеносный матриарх', badgeIcon: '⚡', category: 'mastery', description: '10 верных ответов подряд со средней скоростью <8 сек.', conditionText: 'Стрик из 10 вопросов на высокой скорости.' },
  { id: 'ach-9', title: 'Абсолютная синхрония', badgeIcon: '🎯', category: 'mastery', description: 'Прохождение комплексного клинического сценария с 1-й попытки.', conditionText: 'Решение сценария без единой ошибки.' },
  { id: 'ach-10', title: 'Архитектор ревайлдинга', badgeIcon: '🗺️', category: 'ethology', description: 'Расчет коридора Least-Cost Path и интеграция Beehive Fences.', conditionText: 'Пространственное моделирование биокоридоров.' }
];

export function getAcademicRank(percentDone: number): AcademicRank {
  const p = Math.max(0, Math.min(100, Math.round(percentDone)));
  return ACADEMIC_RANKS.find((r) => p >= r.min && p <= r.max) || ACADEMIC_RANKS[0];
}

export function formatModuleHeader(rawTitle: string, index: number): { code: string; name: string } {
  const match = rawTitle.match(/^Модуль\s+(\d+)\s*:\s*(.+)$/i);
  if (match) {
    return { code: `М${match[1]}`, name: match[2].trim() };
  }
  const replaced = rawTitle.replace(/^Модуль\s+/i, "М").trim();
  const colonIdx = replaced.indexOf(":");
  if (colonIdx !== -1) {
    return {
      code: replaced.slice(0, colonIdx).trim(),
      name: replaced.slice(colonIdx + 1).trim(),
    };
  }
  return { code: `М${index}`, name: replaced };
}

export function formatLessonTitle(rawTitle: string, fallbackIndex: string): { code: string; title: string } {
  const match = rawTitle.match(/^Урок\s+([\d.]+)\s*:\s*(.+)$/i);
  if (match) {
    return { code: match[1], title: match[2].trim() };
  }
  return {
    code: fallbackIndex,
    title: rawTitle.replace(/^Урок\s+[\d.]+\s*:\s*/i, "").trim(),
  };
}

export function findTargetLessonId(course: Course, progress: UserProgress | undefined): string | null {
  const allLessons = course.modules.flatMap((m) => m.lessons);
  if (allLessons.length === 0) return null;

  const isLessonComplete = (lesson: Course["modules"][number]["lessons"][number]) =>
    lesson.steps.length > 0 && lesson.steps.every((s) => getStepStatus(s, progress) !== "idle");

  if (progress?.currentStepId) {
    const activeLesson = allLessons.find((l) => l.steps.some((s) => s.id === progress.currentStepId));
    if (activeLesson && !isLessonComplete(activeLesson)) {
      return activeLesson.id;
    }
  }

  const firstIncomplete = allLessons.find((l) => !isLessonComplete(l));
  return firstIncomplete ? firstIncomplete.id : null;
}

export function checkUnlockedAchievements(progressStore: Record<string, any>): string[] {
  const unlocked: string[] = [];
  for (const cid in progressStore) {
    const p = progressStore[cid];
    if (!p) continue;
    if (p.completedSteps?.includes('step-2-1-2')) unlocked.push('ach-1');
    if (p.completedSteps?.includes('step-3-3-1-3')) unlocked.push('ach-2');
    if (p.completedSteps?.includes('step-2-1-1-2')) unlocked.push('ach-3');
    if (p.completedSteps?.includes('step-3-11-1-4')) unlocked.push('ach-4');
    if (p.completedSteps?.includes('step-3-16-1-4')) unlocked.push('ach-5');
    if (p.completedSteps?.includes('step-0-1-2') || p.completedSteps?.includes('step-1-1-2')) unlocked.push('ach-6');
    if (p.score >= 50) unlocked.push('ach-7');
    if (p.score >= 100) unlocked.push('ach-8');
    if (p.scenarioAnswers && Object.keys(p.scenarioAnswers).length > 0) unlocked.push('ach-9');
    if (p.completedSteps?.length >= 5) unlocked.push('ach-10');
  }
  return Array.from(new Set(unlocked));
}
