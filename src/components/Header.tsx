import { BookOpen, Trophy, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  courseTitle: string;
  courseEmoji: string;
  progress: number;
  score: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Header({
  courseTitle,
  courseEmoji,
  progress,
  score,
  darkMode,
  onToggleDarkMode
}: HeaderProps) {
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

          {/* Course info & progress */}
          <div className="hidden sm:flex items-center gap-4 flex-1 max-w-md mx-4">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 min-w-0">
              <BookOpen className="w-4 h-4 shrink-0 text-indigo-500" />
              <span className="truncate">{courseEmoji} {courseTitle}</span>
            </div>
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

        {/* Mobile progress */}
        <div className="sm:hidden mt-2">
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{Math.round(progress)}% пройдено</p>
        </div>
      </div>
    </header>
  );
}
