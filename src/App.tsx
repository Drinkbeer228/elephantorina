import { useState, useEffect, useCallback } from 'react';
import { Menu } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import StepViewer from './components/StepViewer';
import { COURSES_DATA } from './data/coursesData';
import { UserProgress, Step } from './types/course';

const STORAGE_KEY = 'elephantology-edu-progress';

interface ProgressStore {
  [courseId: string]: UserProgress;
}

function loadProgress(): ProgressStore {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load progress:', e);
  }
  return {};
}

function saveProgress(store: ProgressStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

function createDefaultProgress(courseId: string): UserProgress {
  return {
    courseId,
    completedSteps: [],
    currentStepId: '',
    score: 0,
    bookmarks: [],
    quizAnswers: {},
    startedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  };
}

export default function App() {
  const [progressStore, setProgressStore] = useState<ProgressStore>(loadProgress);
  const [currentCourseId, setCurrentCourseId] = useState<string>(() => {
    try {
      return localStorage.getItem('elephantology-current-course') || COURSES_DATA[0].id;
    } catch {
      return COURSES_DATA[0].id;
    }
  });
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('elephantology-dark-mode') === 'true';
    } catch {
      return false;
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const course = COURSES_DATA.find(c => c.id === currentCourseId) || COURSES_DATA[0];
  
  // Собираем все степы из всех модулей и уроков в плоский массив
  const allSteps: Step[] = course.modules.flatMap(m => 
    m.lessons.flatMap(l => l.steps)
  );

  // Получаем или создаём прогресс для текущего курса
  const progress: UserProgress = progressStore[currentCourseId] 
    ? { ...progressStore[currentCourseId], currentStepId: progressStore[currentCourseId].currentStepId || allSteps[0]?.id || '' }
    : { ...createDefaultProgress(currentCourseId), currentStepId: allSteps[0]?.id || '' };

  // Save progress on change
  useEffect(() => {
    saveProgress(progressStore);
  }, [progressStore]);

  // Save current course
  useEffect(() => {
    localStorage.setItem('elephantology-current-course', currentCourseId);
  }, [currentCourseId]);

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
  const currentIndex = allSteps.findIndex(s => s.id === currentStep?.id);
  const totalSteps = allSteps.length;
  const completedCount = progress.completedSteps.length;
  const progressPercent = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  const updateProgress = useCallback((updater: (prev: UserProgress) => UserProgress) => {
    setProgressStore(prev => ({
      ...prev,
      [currentCourseId]: updater(prev[currentCourseId] || { ...createDefaultProgress(currentCourseId), currentStepId: allSteps[0]?.id || '' })
    }));
  }, [currentCourseId, allSteps]);

  const handleSelectStep = useCallback((stepId: string) => {
    updateProgress(prev => ({
      ...prev,
      currentStepId: stepId,
      lastActivity: new Date().toISOString()
    }));
  }, [updateProgress]);

  const handleCompleteStep = useCallback(() => {
    if (!currentStep) return;
    updateProgress(prev => {
      if (prev.completedSteps.includes(currentStep.id)) return prev;
      return {
        ...prev,
        completedSteps: [...prev.completedSteps, currentStep.id],
        score: prev.score + 10,
        lastActivity: new Date().toISOString()
      };
    });
  }, [currentStep, updateProgress]);

  const handleQuizAnswer = useCallback((stepId: string, answerIndex: number) => {
    updateProgress(prev => ({
      ...prev,
      quizAnswers: { ...prev.quizAnswers, [stepId]: answerIndex },
      lastActivity: new Date().toISOString()
    }));
  }, [updateProgress]);

  const handleToggleBookmark = useCallback((stepId: string) => {
    updateProgress(prev => {
      const bookmarks = prev.bookmarks.includes(stepId)
        ? prev.bookmarks.filter(id => id !== stepId)
        : [...prev.bookmarks, stepId];
      return { ...prev, bookmarks, lastActivity: new Date().toISOString() };
    });
  }, [updateProgress]);

  const handleSelectCourse = useCallback((courseId: string) => {
    setCurrentCourseId(courseId);
    setSidebarOpen(false);
  }, []);

  if (!currentStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-500">Нет доступных степов</p>
      </div>
    );
  }

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
        courses={COURSES_DATA}
        currentCourseId={currentCourseId}
        onSelectCourse={handleSelectCourse}
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
