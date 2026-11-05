export type DashboardSection = 'catalog' | 'atlas' | 'syllabus' | 'bookmarks';

interface HeaderProps {
  currentView: 'dashboard' | 'lesson';
  activeSection?: DashboardSection;
  bookmarksCount?: number;
  onNavigateSection?: (section: DashboardSection) => void;
  onGoToDashboard: () => void;
  onResumeLesson?: () => void;
}

export default function Header({
  currentView,
  activeSection = 'catalog',
  bookmarksCount = 0,
  onNavigateSection,
  onGoToDashboard,
  onResumeLesson,
}: HeaderProps) {
  const handleNavClick = (section: DashboardSection) => {
    if (currentView === 'lesson') {
      onGoToDashboard();
    }
    if (onNavigateSection) {
      onNavigateSection(section);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#E4DFD3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('catalog')}
          className="font-display text-2xl font-bold tracking-tight text-[#181A18] hover:text-[#1E4631] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Слонология.EDU
        </button>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav
          aria-label="Основная навигация"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5C615D]"
        >
          <button
            type="button"
            onClick={() => handleNavClick('catalog')}
            className={`py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 cursor-pointer ${
              currentView === 'dashboard' && activeSection === 'catalog'
                ? 'border-[#1E4631] text-[#181A18] font-semibold'
                : 'border-transparent hover:text-[#181A18]'
            }`}
          >
            Каталог треков
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('atlas')}
            className={`py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 cursor-pointer ${
              currentView === 'dashboard' && activeSection === 'atlas'
                ? 'border-[#1E4631] text-[#181A18] font-semibold'
                : 'border-transparent hover:text-[#181A18]'
            }`}
          >
            Интерактивный атлас
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('syllabus')}
            className={`py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 cursor-pointer ${
              currentView === 'dashboard' && activeSection === 'syllabus'
                ? 'border-[#1E4631] text-[#181A18] font-semibold'
                : 'border-transparent hover:text-[#181A18]'
            }`}
          >
            Учебный план
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('bookmarks')}
            className={`py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 cursor-pointer ${
              currentView === 'dashboard' && activeSection === 'bookmarks'
                ? 'border-[#1E4631] text-[#181A18] font-semibold'
                : 'border-transparent hover:text-[#181A18]'
            }`}
          >
            {bookmarksCount > 0 ? `Закладки (${bookmarksCount})` : 'Закладки'}
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          {currentView === 'dashboard' ? (
            <button
              type="button"
              onClick={onResumeLesson}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#1E4631] hover:bg-[#153423] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Продолжить обучение
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleNavClick('catalog')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#181A18] bg-[#F3EFE6] hover:bg-[#E4DFD3] border border-[#D5CFC0] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              К каталогу треков
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
