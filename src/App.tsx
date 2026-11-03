import { useState, useEffect, useCallback } from 'react';
import { Menu } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import StepViewer from './components/StepViewer';
import { COURSES_DATA } from './data/coursesData';
import { UserProgress, Step } from './types/course';

const STORAGE_KEY = 'elephantology-edu-progress';

function loadProgress(): UserProgress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load progress:', e);
  }
  return {
    courseId: 'track-1-anatomy',
    completedSteps: [],
    currentStepId: 'step-1-1-1',
    score: 0,
    bookmarks: [],
    quizAnswers: {},
    startedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  };
}

function saveProgress(progress: UserProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

export default function App() {
  const course = COURSES_DATA[0];
  
  // Собираем все степы из всех модулей и уроков в плоский массив
  const allSteps: Step[] = course.modules.flatMap(m => 
    m.lessons.flatMap(l => l.steps)
  );

  const [progress, setProgress] = useState<UserProgress>(loadProgress);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('elephantology-dark-mode') === 'true';
    } catch {
      return false;
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Save progress on change
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('elephantology-dark-mode', String(darkMode));
  }, [darkMode]);

  const currentStep = allSteps.find(s => s.id === progress.currentStepId) || allSteps[0];
  const currentIndex = allSteps.findIndex(s => s.id === currentStep.id);
  const totalSteps = allSteps.length;
  const completedCount = progress.completedSteps.length;
  const progressPercent = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  const handleSelectStep = useCallback((stepId: string) => {
    setProgress(prev => ({
      ...prev,
      currentStepId: stepId,
      lastActivity: new Date().toISOString()
    }));
  }, []);

  const handleCompleteStep = useCallback(() => {
    setProgress(prev => {
      if (prev.completedSteps.includes(currentStep.id)) return prev;
      return {
        ...prev,
        completedSteps: [...prev.completedSteps, currentStep.id],
        score: prev.score + 10,
        lastActivity: new Date().toISOString()
      };
    });
  }, [currentStep.id]);

  const handleQuizAnswer = useCallback((stepId: string, answerIndex: number) => {
    setProgress(prev => ({
      ...prev,
      quizAnswers: { ...prev.quizAnswers, [stepId]: answerIndex },
      lastActivity: new Date().toISOString()
    }));
  }, []);

  const handleToggleBookmark = useCallback((stepId: string) => {
    setProgress(prev => {
      const bookmarks = prev.bookmarks.includes(stepId)
        ? prev.bookmarks.filter(id => id !== stepId)
        : [...prev.bookmarks, stepId];
      return { ...prev, bookmarks, lastActivity: new Date().toISOString() };
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <Header
        courseTitle={course.title}
        courseIcon={course.icon}
        progress={progressPercent}
        score={progress.score}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(prev => !prev)}
      />

      {/* Main layout */}
      <div className="flex h-[calc(100vh - 65px)]">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-20 left-4 z-30 p-3 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition-colors"
          aria-label="Открыть меню"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Sidebar */}
        <Sidebar
          course={course}
          allSteps={allSteps}
          currentStepId={currentStep.id}
          completedSteps={progress.completedSteps}
          onSelectStep={handleSelectStep}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <StepViewer
            step={currentStep}
            steps={allSteps}
            currentIndex={currentIndex}
            completedSteps={progress.completedSteps}
            bookmarks={progress.bookmarks}
            quizAnswers={progress.quizAnswers}
            onNavigate={handleSelectStep}
            onComplete={handleCompleteStep}
            onQuizAnswer={handleQuizAnswer}
            onToggleBookmark={handleToggleBookmark}
          />
        </main>
      </div>
    </div>
  );
}
