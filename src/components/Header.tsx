import { Trophy, Menu, Compass } from 'lucide-react';

interface HeaderProps {
  currentView: 'dashboard' | 'lesson';
  courseTitle: string;
  progress: number;
  score: number;
  onToggleSidebar?: () => void;
  onGoToDashboard: () => void;
}

export default function Header({
  currentView,
  score,
  onToggleSidebar,
  onGoToDashboard,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E6E4DD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {currentView === 'lesson' && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-[#606462] hover:bg-[#F8F7F4] transition-colors md:hidden"
              aria-label="Открыть меню"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onGoToDashboard}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#2E5A44]/10 flex items-center justify-center text-lg">
              🐘
            </div>
            <div className="text-left">
              <h1 className="text-base font-bold text-[#1C1E1F] group-hover:text-[#2E5A44] transition-colors">
                Слонология.EDU
              </h1>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F7F4] border border-[#E6E4DD] rounded-full">
            <Trophy className="w-4 h-4 text-[#C86D51]" />
            <span className="text-sm font-semibold text-[#1C1E1F]">{score}</span>
          </div>
          <button
            onClick={onGoToDashboard}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F7F4] hover:bg-[#E6E4DD]/50 border border-[#E6E4DD] rounded-xl text-xs font-medium text-[#606462] transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Все треки</span>
          </button>
        </div>
      </div>
    </header>
  );
}
