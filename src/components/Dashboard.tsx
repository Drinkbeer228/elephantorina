import { Brain, Shield, Rocket, Users, Activity, Compass } from 'lucide-react';
import { Course, UserProgress } from '../types/course';

interface DashboardProps {
  courses: Course[];
  progressStore: Record<string, UserProgress>;
  onSelectCourse: (courseId: string) => void;
}

const TRACK_ICONS: Record<string, JSX.Element> = {
  'track-1-anatomy': <Brain className="w-6 h-6 text-[#2E5A44]" />,
  'track-2-ethology': <Users className="w-6 h-6 text-[#2E5A44]" />,
  'track-3-veterinary': <Shield className="w-6 h-6 text-[#2E5A44]" />,
  'track-4-evolution': <Activity className="w-6 h-6 text-[#2E5A44]" />
};

export default function Dashboard({ courses, progressStore, onSelectCourse }: DashboardProps) {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1C1E1F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Hero Banner */}
        <div className="bg-white rounded-2xl border border-[#E6E4DD] p-8 sm:p-12 shadow-xs relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#2E5A44]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2E5A44]/10 rounded-full text-xs font-semibold text-[#2E5A44]">
              <Compass className="w-3.5 h-3.5" />
              <span>Академия знаний о слонах</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1E1F]">
              Слонология.EDU
            </h1>
            <p className="text-base sm:text-lg text-[#606462] leading-relaxed">
              Интерактивная образовательная платформа по биологии, анатомии, поведению и обогащению среды обитания слонов.
            </p>
          </div>
        </div>

        {/* Catalog */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#1C1E1F]">Учебные треки</h2>
            <span className="text-sm text-[#606462]">{courses.length} активных трека</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const progress = progressStore[course.id];
              const allSteps = course.modules.flatMap(m => m.lessons.flatMap(l => l.steps));
              const completedCount = progress?.completedSteps.length || 0;
              const totalSteps = allSteps.length;
              const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-[#E6E4DD] p-6 flex flex-col justify-between shadow-xs hover:border-[#2E5A44]/40 transition-all duration-200 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#2E5A44]/10 flex items-center justify-center">
                        {TRACK_ICONS[course.id] || <Brain className="w-6 h-6 text-[#2E5A44]" />}
                      </div>
                      <span className="text-xs font-semibold text-[#606462] px-2.5 py-1 bg-[#F8F7F4] rounded-full border border-[#E6E4DD]">
                        {course.modules.length} модуля
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#1C1E1F] group-hover:text-[#2E5A44] transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-[#606462] mt-2 leading-relaxed line-clamp-3">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-[#E6E4DD] space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                        <span className="text-[#606462]">Прогресс</span>
                        <span className="text-[#2E5A44] font-semibold">{progressPercent}%</span>
                      </div>
                      <div className="h-2 bg-[#F8F7F4] border border-[#E6E4DD] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2E5A44] rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectCourse(course.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E5A44] hover:bg-[#244936] text-white text-sm font-semibold shadow-xs transition-colors"
                    >
                      <Rocket className="w-4 h-4" />
                      <span>{completedCount > 0 ? 'Продолжить обучение' : 'Начать обучение'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
