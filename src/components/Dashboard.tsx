import { BookOpen, Brain, Shield, Rocket, CheckCircle2, Layers, HelpCircle, Stethoscope } from 'lucide-react';
import { Course, UserProgress } from '../types/course';

interface DashboardProps {
  courses: Course[];
  progressStore: Record<string, UserProgress>;
  onSelectCourse: (courseId: string) => void;
}

function getCourseIcon(iconName: string) {
  switch (iconName) {
    case 'Brain':
      return <Brain className="w-8 h-8" />;
    case 'Users':
      return <span className="text-3xl">👥</span>;
    case 'ShieldCross':
      return <Shield className="w-8 h-8" />;
    default:
      return <BookOpen className="w-8 h-8" />;
  }
}

function getCourseGradient(iconName: string) {
  switch (iconName) {
    case 'Brain':
      return 'from-indigo-500 to-purple-600';
    case 'Users':
      return 'from-teal-500 to-cyan-600';
    case 'ShieldCross':
      return 'from-rose-500 to-pink-600';
    default:
      return 'from-slate-500 to-slate-600';
  }
}

export default function Dashboard({ courses, progressStore, onSelectCourse }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-700/50 shadow-xl p-8 sm:p-12 mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl -translate-y-32 translate-x-32" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">🐘</span>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Слонология.EDU
              </h1>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-3">
              Наука о хоботных
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              Профессиональная обучающая платформа по анатомии, этологии, подиатрии и ветеринарии слонов для киперов и ветврачей.
            </p>
          </div>
        </div>

        {/* Courses Catalog */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
            Выберите учебный трек
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const progress = progressStore[course.id];
              const allSteps = course.modules.flatMap(m => m.lessons.flatMap(l => l.steps));
              const completedCount = progress?.completedSteps.length || 0;
              const totalSteps = allSteps.length;
              const progressPercent = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

              return (
                <div
                  key={course.id}
                  className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  {/* Course header with gradient */}
                  <div className={`h-2 bg-gradient-to-r ${getCourseGradient(course.icon)}`} />
                  
                  <div className="p-6">
                    {/* Icon and title */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getCourseGradient(course.icon)} text-white flex items-center justify-center shadow-lg`}>
                        {getCourseIcon(course.icon)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                          {course.title}
                        </h4>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 min-h-[60px]">
                      {course.description}
                    </p>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-600 dark:text-slate-400">Прогресс</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {completedCount}/{totalSteps} степов
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getCourseGradient(course.icon)} rounded-full transition-all duration-500`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {Math.round(progressPercent)}% пройдено
                      </p>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => onSelectCourse(course.id)}
                      className={`
                        w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                        bg-gradient-to-r ${getCourseGradient(course.icon)}
                        text-white font-semibold text-sm
                        shadow-md hover:shadow-lg
                        transform hover:scale-[1.02]
                        transition-all duration-200
                      `}
                    >
                      <Rocket className="w-4 h-4" />
                      {completedCount > 0 ? 'Продолжить обучение' : 'Перейти к треку'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-700/50 shadow-lg p-6 sm:p-8">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Rocket className="w-6 h-6 text-indigo-500" />
            Быстрый старт
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Theory */}
            <div className="flex items-start gap-3 p-4 bg-indigo-50/80 dark:bg-indigo-900/20 rounded-2xl border border-indigo-200/50 dark:border-indigo-700/50">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                  Теория
                </p>
                <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 leading-relaxed">
                  Изучайте фундаментальные знания с клиническими рекомендациями
                </p>
              </div>
            </div>

            {/* Quiz */}
            <div className="flex items-start gap-3 p-4 bg-purple-50/80 dark:bg-purple-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
              <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">
                  Тесты
                </p>
                <p className="text-xs text-purple-600/80 dark:text-purple-400/80 leading-relaxed">
                  Проверяйте знания с мгновенной обратной связью
                </p>
              </div>
            </div>

            {/* Flashcards */}
            <div className="flex items-start gap-3 p-4 bg-teal-50/80 dark:bg-teal-900/20 rounded-2xl border border-teal-200/50 dark:border-teal-700/50">
              <Layers className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-teal-700 dark:text-teal-300 mb-1">
                  Карточки
                </p>
                <p className="text-xs text-teal-600/80 dark:text-teal-400/80 leading-relaxed">
                  Запоминайте термины через интерактивные 3D-карточки
                </p>
              </div>
            </div>

            {/* Scenario */}
            <div className="flex items-start gap-3 p-4 bg-rose-50/80 dark:bg-rose-900/20 rounded-2xl border border-rose-200/50 dark:border-rose-700/50">
              <Stethoscope className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 mb-1">
                  Симуляторы
                </p>
                <p className="text-xs text-rose-600/80 dark:text-rose-400/80 leading-relaxed">
                  Тренируйте клиническое мышление в реалистичных кейсах
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-50/80 dark:bg-amber-900/20 rounded-2xl border border-amber-200/50 dark:border-amber-700/50">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-1">
                  Совет
                </p>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/80 leading-relaxed">
                  Прогресс автоматически сохраняется. Возвращайтесь к урокам в любое время. Кликайте на закладки, чтобы отмечать важные материалы.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
