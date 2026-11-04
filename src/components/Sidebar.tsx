import { useState } from 'react';
import { BookOpen, ChevronRight, CheckCircle2, ChevronLeft, Menu, Compass } from 'lucide-react';
import { Course, UserProgress } from '../types/course';

interface SidebarProps {
  course: Course;
  progress: UserProgress;
  onSelectStep: (stepId: string) => void;
  onGoToDashboard: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export default function Sidebar({
  course,
  progress,
  onSelectStep,
  onGoToDashboard,
  isOpen,
  onToggleOpen,
}: SidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    // Раскрываем все модули по умолчанию
    const initial: Record<string, boolean> = {};
    course.modules.forEach(m => { initial[m.id] = true; });
    return initial;
  });

  const toggleModule = (modId: string) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const totalSteps = course.modules.flatMap(m => m.lessons.flatMap(l => l.steps)).length;
  const completedSteps = progress.completedSteps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <>
      {/* Кнопка открытия на мобильных / когда закрыто */}
      {!isOpen && (
        <button
          onClick={onToggleOpen}
          className="fixed left-4 bottom-4 z-40 bg-[#2E5A44] text-white p-3 rounded-full shadow-lg hover:bg-[#244936] transition-all flex items-center justify-center md:hidden"
          aria-label="Открыть навигацию по курсу"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Оверлей для мобилок */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40 md:hidden" 
          onClick={onToggleOpen}
        />
      )}

      {/* Боковая панель */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-80 bg-white border-r border-[#E6E4DD] flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:static md:w-72'}
      `}>
        {/* Шапка сайдбара */}
        <div className="p-4 border-b border-[#E6E4DD] flex items-center justify-between bg-[#F8F7F4]/50">
          <button
            onClick={onGoToDashboard}
            className="flex items-center gap-2 text-sm font-semibold text-[#1C1E1F] hover:text-[#2E5A44] transition-colors"
          >
            <Compass className="w-4 h-4 text-[#2E5A44]" />
            <span>Все курсы</span>
          </button>
          <button
            onClick={onToggleOpen}
            className="p-1.5 rounded-lg text-[#606462] hover:bg-[#E6E4DD]/50 transition-colors md:hidden"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Прогресс курса */}
        <div className="p-4 border-b border-[#E6E4DD] bg-[#F8F7F4]/30">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-[#606462] uppercase tracking-wider">Прогресс трека</span>
            <span className="text-xs font-bold text-[#2E5A44]">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-[#E6E4DD] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2E5A44] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-[#606462] mt-1.5 font-medium">{completedSteps} из {totalSteps} шагов пройденo</p>
        </div>

        {/* Список модулей и уроков */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <h2 className="px-2 text-xs font-semibold text-[#606462] uppercase tracking-wider">Структура курса</h2>
          {course.modules.map((mod, modIdx) => {
            const isExpanded = expandedModules[mod.id] ?? true;
            const modStepsCount = mod.lessons.flatMap(l => l.steps).length;
            const modCompletedCount = mod.lessons.flatMap(l => l.steps).filter(s => progress.completedSteps.includes(s.id)).length;
            const isModComplete = modStepsCount > 0 && modCompletedCount === modStepsCount;

            return (
              <div key={mod.id} className="border border-[#E6E4DD] rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-[#F8F7F4] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-[#2E5A44]/10 text-[#2E5A44] text-xs font-bold flex items-center justify-center shrink-0">
                      {modIdx}
                    </span>
                    <span className="text-sm font-semibold text-[#1C1E1F] truncate">{mod.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isModComplete && <CheckCircle2 className="w-4 h-4 text-[#2E5A44]" />}
                    <ChevronRight className={`w-4 h-4 text-[#606462] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-[#E6E4DD] bg-[#F8F7F4]/30 divide-y divide-[#E6E4DD]/50">
                    {mod.lessons.map((lesson) => {
                      const lessonCompleted = lesson.steps.every(s => progress.completedSteps.includes(s.id));
                      const isCurrentLesson = lesson.steps.some(s => s.id === progress.currentStepId);

                      return (
                        <div key={lesson.id} className="p-2 space-y-1">
                          <div className="flex items-center justify-between px-2 py-1">
                            <span className="text-xs font-medium text-[#606462] truncate flex-1">{lesson.title}</span>
                            {lessonCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-[#2E5A44] shrink-0 ml-1" />}
                          </div>
                          <div className="pl-2 space-y-0.5">
                            {lesson.steps.map((step) => {
                              const isSelected = step.id === progress.currentStepId;
                              const isCompleted = progress.completedSteps.includes(step.id);

                              return (
                                <button
                                  key={step.id}
                                  onClick={() => {
                                    onSelectStep(step.id);
                                    if (window.innerWidth < 768) {
                                      onToggleOpen();
                                    }
                                  }}
                                  className={`
                                    w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-2
                                    ${isSelected
                                      ? 'bg-[#2E5A44] text-white font-medium shadow-xs'
                                      : isCompleted
                                        ? 'text-[#1C1E1F] hover:bg-[#E6E4DD]/50'
                                        : 'text-[#606462] hover:bg-[#E6E4DD]/40'
                                    }
                                  `}
                                >
                                  <span className={`w-2 h-2 rounded-full shrink-0 ${isCompleted ? 'bg-[#2E5A44]' : isSelected ? 'bg-white' : 'bg-[#E6E4DD]'}`} />
                                  <span className="truncate flex-1">{step.title}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Футер сайдбара */}
        <div className="p-3 border-t border-[#E6E4DD] bg-[#F8F7F4]/55 text-center">
          <p className="text-xs text-[#606462]">Слонология.EDU • Тактильный дизайн</p>
        </div>
      </aside>
    </>
  );
}
