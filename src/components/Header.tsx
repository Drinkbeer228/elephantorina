import { useState } from 'react';
import { Trophy, Moon, Sun, ChevronDown, GraduationCap } from 'lucide-react';
import { Course } from '../types/course';

interface HeaderProps {
  courseTitle: string;
  courseIcon: string;
  progress: number;
  score: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  courses: Course[];
  currentCourseId: string;
  onSelectCourse: (courseId: string) => void;
}

function getCourseIcon(iconName: string) {
  switch (iconName) {
    case 'Brain':
      return <span className="text-lg">🧠</span>;
    case 'Users':
      return <span className="text-lg">👥</span>;
    case 'ShieldCross':
      return <span className="text-lg">🛡️</span>;
    default:
      return <GraduationCap className="w-5 h-5" />;
  }
}

export default function Header({
  courseTitle,
  progress,
  score,
  darkMode,
  onToggleDarkMode,
  courses,
  currentCourseId,
  onSelectCourse
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const currentCourse = courses.find(c => c.id === currentCourseId) || courses[0];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-2xl">🐘</span>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent truncate">
                Слонология.EDU
              </h1>
            </div>
          </div>

          {/* Course selector + progress */}
          <div className="hidden sm:flex items-center gap-4 flex-1 max-w-md mx-4">
            {/* Course dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors min-w-0 max-w-[220px]"
              >
                {getCourseIcon(currentCourse.icon)}
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                  {currentCourse.title.split(':')[0]}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl z-20 overflow-hidden">
                    <div className="p-2">
                      <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Доступные треки
                      </p>
                      {courses.map(course => (
                        <button
                          key={course.id}
                          onClick={() => {
                            onSelectCourse(course.id);
                            setDropdownOpen(false);
                          }}
                          className={`
                            w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors
                            ${course.id === currentCourseId
                              ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                            }
                          `}
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                            {getCourseIcon(course.icon)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                              {course.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                              {course.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Progress bar */}
            <div className="flex-1 min-w-[100px]">
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{Math.round(progress)}% пройдено</p>
            </div>
          </div>

          {/* Score & Dark mode */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-full border border-amber-200 dark:border-amber-700/50">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">{score}</span>
            </div>
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Переключить тему"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile progress + course selector */}
        <div className="sm:hidden mt-2 flex items-center gap-3">
          <div className="flex-1">
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{Math.round(progress)}% пройдено</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              {getCourseIcon(currentCourse.icon)}
              <ChevronDown className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl z-20 overflow-hidden">
                  <div className="p-2">
                    {courses.map(course => (
                      <button
                        key={course.id}
                        onClick={() => {
                          onSelectCourse(course.id);
                          setDropdownOpen(false);
                        }}
                        className={`
                          w-full flex items-center gap-2 p-2.5 rounded-xl text-left transition-colors
                          ${course.id === currentCourseId
                            ? 'bg-indigo-50 dark:bg-indigo-900/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          }
                        `}
                      >
                        {getCourseIcon(course.icon)}
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                          {course.title.split(':')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
