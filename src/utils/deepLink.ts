import type { Course } from '../types/course';

export interface LessonTarget {
  courseId: string;
  stepId: string;
}

/**
 * Resolves `?course=<courseId>&lesson=<lessonId>` (used by links from other
 * projects, e.g. the Research Station library) to the first step of that lesson.
 * Returns null when either id is missing or unknown.
 */
export function lessonTarget(search: string, courses: readonly Course[]): LessonTarget | null {
  const params = new URLSearchParams(search);
  const courseId = params.get('course');
  const lessonId = params.get('lesson');
  if (!courseId || !lessonId) return null;
  const course = courses.find((c) => c.id === courseId);
  const lesson = course?.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
  const stepId = lesson?.steps[0]?.id;
  return course && stepId ? { courseId: course.id, stepId } : null;
}

/** The current URL without the lesson link parameters, so a reload does not jump back. */
export function withoutLessonParams(href: string): string {
  const url = new URL(href);
  url.searchParams.delete('course');
  url.searchParams.delete('lesson');
  return url.pathname + url.search + url.hash;
}
