import { useState, useEffect } from 'react';
import { ChevronRight, Check, X, Compass } from 'lucide-react';
import { Course, UserProgress } from '../types/course';

interface SidebarProps {
  courses: Course[];
  course: Course;
  progress: UserProgress;
  onSelectCourse: (courseId: string) => void;
  onSelectStep: (stepId: string) => void;
  onGoToDashboard: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export default function Sidebar({
  courses,
  course,
  progress,
  onSelectCourse,
  onSelectStep,
  onGoToDashboard,
  isOpen,
  onToggleOpen,
}: SidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Keep the module containing the active step expanded automatically
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    course.modules.forEach((m, idx) => {
      const hasCurrentStep = m.lessons.some((l) =>
        l.steps.some((s) => s.id === progress.currentStepId)
      );
      initial[m.id] = hasCurrentStep || idx < 2;
    });
    setExpandedModules(initial);
  }, [course.id, progress.currentStepId, course.modules]);

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const totalSteps = course.modules.flatMap((m) => m.lessons.flatMap((l) => l.steps)).length;
  const completedSteps = course.modules
    .flatMap((m) => m.lessons.flatMap((l) => l.steps))
    .filter((s) => progress.completedSteps.includes(s.id)).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 lg:hidden"
          onClick={onToggleOpen}
        />
      )}

      {/* Curriculum Sidebar */}
      <aside
        aria-label="Структура учебного трека"
        className={`fixed top-0 left-0 bottom-0 z-50 w-80 bg-[#FBF9F5] border-r border-[#E4DFD3] flex flex-col transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:static lg:w-80 shrink-0'
        }`}
      >
        {/* Track Selector Header */}
        <div className="p-4 border-b border-[#E4DFD3] bg-white space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onGoToDashboard}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#1E4631] hover:underline cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Все академические треки</span>
            </button>
            <button
              type="button"
              onClick={onToggleOpen}
              aria-label="Закрыть оглавление"
              className="p-1.5 rounded-lg text-[#5C615D] hover:bg-[#F3EFE6] transition-colors lg:hidden cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label
              htmlFor="sidebar-track-select"
              className="block text-[11px] font-bold uppercase tracking-wider text-[#5C615D] mb-1"
            >
              Активный трек ({courses.length})
            </label>
            <select
              id="sidebar-track-select"
              value={course.id}
              onChange={(e) => onSelectCourse(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#FBF9F5] border border-[#D8D2C2] text-xs font-semibold text-[#181A18] cursor-pointer"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Track Progress Telemetry */}
        <div className="px-4 py-3.5 border-b border-[#E4DFD3] bg-[#F3EFE6]/60">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="font-semibold text-[#5C615D]">Освоение трека</span>
            <span className="font-mono-code font-bold text-[#1E4631] tabular-nums">
              {completedSteps} / {totalSteps} ({progressPercent}%)
            </span>
          </div>
          <div className="h-1.5 bg-[#E4DFD3] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1E4631] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Modules & Lessons Tree */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {course.modules.map((mod, modIdx) => {
            const isExpanded = expandedModules[mod.id] ?? false;
            const modSteps = mod.lessons.flatMap((l) => l.steps);
            const modCompleted = modSteps.filter((s) =>
              progress.completedSteps.includes(s.id)
            ).length;
            const isModComplete = modSteps.length > 0 && modCompleted === modSteps.length;

            return (
              <div
                key={mod.id}
                className="border border-[#E4DFD3] rounded-xl overflow-hidden bg-white"
              >
                <button
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  aria-expanded={isExpanded}
                  className="w-full flex items-start justify-between gap-2.5 p-3 text-left hover:bg-[#FBF9F5] transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded text-[11px] font-mono-code font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        isModComplete
                          ? 'bg-[#1E4631] text-white'
                          : 'bg-[#F3EFE6] text-[#1E4631] border border-[#E4DFD3]'
                      }`}
                    >
                      {isModComplete ? (
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      ) : (
                        String(modIdx + 1).padStart(2, '0')
                      )}
                    </span>
                    <div className="min-w-0">
                      <span className="block text-xs font-semibold text-[#181A18] leading-snug line-clamp-2">
                        {mod.title}
                      </span>
                      <span className="block text-[11px] text-[#5C615D] mt-0.5 tabular-nums">
                        {modCompleted} из {modSteps.length} шагов
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-[#5C615D] shrink-0 mt-1 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-[#E4DFD3] bg-[#FBF9F5] divide-y divide-[#E4DFD3]/70">
                    {mod.lessons.map((lesson) => (
                      <div key={lesson.id} className="p-2.5 space-y-1">
                        <p className="px-2 py-0.5 text-[11px] font-semibold text-[#5C615D] leading-snug">
                          {lesson.title}
                        </p>
                        <div className="space-y-0.5">
                          {lesson.steps.map((step, sIdx) => {
                            const isSelected = step.id === progress.currentStepId;
                            const isCompleted = progress.completedSteps.includes(step.id);

                            return (
                              <button
                                key={step.id}
                                type="button"
                                onClick={() => {
                                  onSelectStep(step.id);
                                  if (window.innerWidth < 1024) {
                                    onToggleOpen();
                                  }
                                }}
                                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center gap-2.5 cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#1E4631] text-white font-semibold'
                                    : isCompleted
                                      ? 'text-[#181A18] hover:bg-[#F3EFE6]'
                                      : 'text-[#5C615D] hover:bg-[#F3EFE6]/70'
                                }`}
                              >
                                <span
                                  className={`font-mono-code text-[10px] w-4 text-center shrink-0 ${
                                    isSelected
                                      ? 'text-white/90 font-bold'
                                      : isCompleted
                                        ? 'text-[#1E4631] font-bold'
                                        : 'text-[#7A7F7A]'
                                  }`}
                                >
                                  {isCompleted ? '✓' : `${sIdx + 1}.`}
                                </span>
                                <span className="truncate flex-1">
                                  {step.title.replace(/^\d+\.\s*/, '')}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
