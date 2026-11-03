import { BookOpen, Brain, Shield, Rocket, CheckCircle2, Layers, HelpCircle, Stethoscope, Users, Heart, Activity } from 'lucide-react';
import { Course, UserProgress } from '../types/course';

interface DashboardProps {
  courses: Course[];
  progressStore: Record<string, UserProgress>;
  onSelectCourse: (courseId: string) => void;
}

// Цветовая схема для каждого трека
const TRACK_THEMES = {
  'track-1-anatomy': {
    gradient: 'from-[#0593C6] to-[#7C5CE0]',
    gradientSoft: 'from-[#0593C6]/10 to-[#7C5CE0]/10',
    border: 'border-[#0593C6]/30',
    text: 'text-[#0593C6]',
    bg: 'bg-[#0593C6]',
    icon: <Brain className="w-8 h-8" />,
    label: 'Анатомия и физиология'
  },
  'track-2-ethology': {
    gradient: 'from-[#00B4D8] to-[#0077B6]',
    gradientSoft: 'from-[#00B4D8]/10 to-[#0077B6]/10',
    border: 'border-[#00B4D8]/30',
    text: 'text-[#00B4D8]',
    bg: 'bg-[#00B4D8]',
    icon: <Users className="w-8 h-8" />,
    label: 'Этология и поведение'
  },
  'track-3-veterinary': {
    gradient: 'from-[#D83996] to-[#FF6B9D]',
    gradientSoft: 'from-[#D83996]/10 to-[#FF6B9D]/10',
    border: 'border-[#D83996]/30',
    text: 'text-[#D83996]',
    bg: 'bg-[#D83996]',
    icon: <Shield className="w-8 h-8" />,
    label: 'Ветеринария'
  },
  'track-4-evolution': {
    gradient: 'from-[#0593C6] to-[#00B4D8]',
    gradientSoft: 'from-[#0593C6]/10 to-[#00B4D8]/10',
    border: 'border-[#0593C6]/30',
    text: 'text-[#0593C6]',
    bg: 'bg-[#0593C6]',
    icon: <Activity className="w-8 h-8" />,
    label: 'Эволюция'
  }
};

function getTrackTheme(courseId: string) {
  return TRACK_THEMES[courseId as keyof typeof TRACK_THEMES] || TRACK_THEMES['track-1-anatomy'];
}

export default function Dashboard({ courses, progressStore, onSelectCourse }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#0593C6]/5 to-[#D83996]/5 dark:from-slate-950 dark:via-[#0593C6]/10 dark:to-[#D83996]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[24px] border border-slate-200/60 dark:border-slate-700/50 shadow-xl mb-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#0593C6]/20 to-[#D83996]/20 rounded-full blur-3xl -translate-y-48 translate-x-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#D83996]/10 to-[#0593C6]/10 rounded-full blur-3xl translate-y-48 -translate-x-48" />
          
          <div className="relative p-8 sm:p-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0593C6] to-[#D83996] flex items-center justify-center shadow-lg">
                <span className="text-4xl">🐘</span>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#0593C6] to-[#D83996] bg-clip-text text-transparent">
                  Слонология.EDU
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Наука о хоботных</p>
              </div>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
              Профессиональная обучающая платформа
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              Комплексное обучение по анатомии, этологии, подиатрии и ветеринарии слонов для киперов и ветврачей. Интерактивные клинические симуляторы, теоретические модули и практические кейсы.
            </p>
          </div>
        </div>

        {/* Courses Catalog */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Rocket className="w-6 h-6 text-[#0593C6]" />
            Выберите учебный трек
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const progress = progressStore[course.id];
              const allSteps = course.modules.flatMap(m => m.lessons.flatMap(l => l.steps));
              const completedCount = progress?.completedSteps.length || 0;
              const totalSteps = allSteps.length;
              const progressPercent = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
              const theme = getTrackTheme(course.id);

              return (
                <div
                  key={course.id}
                  className={`group relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[24px] border ${theme.border} shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}
                >
                  {/* Gradient header */}
                  <div className={`h-2 bg-gradient-to-r ${theme.gradient}`} />
                  
                  <div className="p-6">
                    {/* Icon and title */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.gradient} text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                        {theme.icon}
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-semibold ${theme.text} uppercase tracking-wider mb-1`}>
                          {theme.label}
                        </p>
                        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">
                          {course.title}
                        </h4>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5 min-h-[60px]">
                      {course.description}
                    </p>

                    {/* Progress bar */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Прогресс</span>
                        <span className={`font-bold ${theme.text}`}>
                          {completedCount}/{totalSteps} степов
                        </span>
                      </div>
                      <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${theme.gradient} rounded-full transition-all duration-500 ease-out`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                        {Math.round(progressPercent)}% пройдено
                      </p>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => onSelectCourse(course.id)}
                      className={`
                        w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                        bg-gradient-to-r ${theme.gradient}
                        text-white font-semibold text-sm
                        shadow-md hover:shadow-lg
                        transform hover:scale-[1.02] hover:-translate-y-0.5
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
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[24px] border border-slate-200/60 dark:border-slate-700/50 shadow-lg p-6 sm:p-8">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Rocket className="w-6 h-6 text-[#D83996]" />
            Быстрый старт
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Theory */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-[#0593C6]/10 to-[#7C5CE0]/10 rounded-2xl border border-[#0593C6]/20">
              <BookOpen className="w-5 h-5 text-[#0593C6] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#0593C6] mb-1">Теория</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Фундаментальные знания с клиническими рекомендациями
                </p>
              </div>
            </div>

            {/* Quiz */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-[#7C5CE0]/10 to-[#D83996]/10 rounded-2xl border border-[#7C5CE0]/20">
              <HelpCircle className="w-5 h-5 text-[#7C5CE0] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#7C5CE0] mb-1">Тесты</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Проверка знаний с мгновенной обратной связью
                </p>
              </div>
            </div>

            {/* Flashcards */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-[#00B4D8]/10 to-[#0077B6]/10 rounded-2xl border border-[#00B4D8]/20">
              <Layers className="w-5 h-5 text-[#00B4D8] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#00B4D8] mb-1">Карточки</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Интерактивные 3D-карточки для запоминания терминов
                </p>
              </div>
            </div>

            {/* Scenario */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-[#D83996]/10 to-[#FF6B9D]/10 rounded-2xl border border-[#D83996]/20">
              <Stethoscope className="w-5 h-5 text-[#D83996] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#D83996] mb-1">Симуляторы</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Клинические кейсы для тренировки мышления
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-[#0593C6]/5 to-[#D83996]/5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#0593C6] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Совет
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
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
