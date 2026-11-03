import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import LessonHeader from './components/LessonHeader';
import StepViewer from './components/StepViewer';
import Dashboard from './components/Dashboard';
import { COURSES_DATA } from './data/coursesData';
import { UserProgress, Step } from './types/course';

const STORAGE_KEY = 'elephantology-edu-progress';

interface ProgressStore {
  [courseId: string]: UserProgress;
}

type ViewType = 'DASHBOARD' | 'LESSON';

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
    scenarioAnswers: {},
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
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('elephantology-dark-mode') === 'true';
    } catch {
      return false;
    }
  });

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

  // Находим урок, к которому относится текущий степ (для шапки в стиле Stepik)
  const currentLesson = course.modules.flatMap(m => m.lessons).find(l =>
    l.steps.some(s => s.id === currentStep?.id)
  );

  // Шаги текущего урока — для ленты табов; если урок не найден, показываем все шаги курса
  const lessonSteps: Step[] = currentLesson?.steps ?? allSteps;

  // Читаемый номер урока из заголовка («Урок 1.2: ...» -> «1.2») либо позиционный
  const lessonNumber = (() => {
    if (!currentLesson) return undefined;
    const match = currentLesson.title.match(/Урок\s+([\d.]+)/i);
    if (match) return match[1];
    const lessons = course.modules.flatMap(m => m.lessons);
    const idx = lessons.findIndex(l => l.id === currentLesson.id);
    return idx >= 0 ? String(idx + 1) : undefined;
  })();

  // Название урока без префикса «Урок X.Y:»
  const lessonTitle = (() => {
    if (!currentLesson) return course.title;
    const colonIdx = currentLesson.title.indexOf(':');
    return colonIdx > -1 && /^урок/i.test(currentLesson.title)
      ? currentLesson.title.slice(colonIdx + 1).trim()
      : currentLesson.title;
  })();

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

  const handleScenarioAnswer = useCallback((stepId: string, optionId: string) => {
    updateProgress(prev => ({
      ...prev,
      scenarioAnswers: { ...prev.scenarioAnswers, [stepId]: optionId },
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
    setCurrentView('LESSON');
  }, []);

  const handleGoToDashboard = useCallback(() => {
    setCurrentView('DASHBOARD');
  }, []);

  // Dashboard View
  if (currentView === 'DASHBOARD') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <Header
          currentView="dashboard"
          courseTitle="Главная"
          courseIcon="Home"
          progress={0}
          score={0}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(prev => !prev)}
          courses={COURSES_DATA}
          currentCourseId={currentCourseId}
          onSelectCourse={handleSelectCourse}
          onLogoClick={handleGoToDashboard}
        />
        <Dashboard
          courses={COURSES_DATA}
          progressStore={progressStore}
          onSelectCourse={handleSelectCourse}
        />
      </div>
    );
  }

  // Lesson View
  if (!currentStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-500">Нет доступных степов</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Шапка урока в стиле нативного iOS-приложения Stepik:
          Top App Bar + горизонтальная лента шагов */}
      <LessonHeader
        lessonTitle={lessonTitle}
        lessonNumber={lessonNumber}
        steps={lessonSteps}
        currentStepId={currentStep.id}
        completedSteps={progress.completedSteps}
        onSelectStep={handleSelectStep}
        onBack={handleGoToDashboard}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(prev => !prev)}
        score={progress.score}
      />

      {/* Main content — сразу под лентой шагов, без FAB и бокового меню */}
      <main className="h-[calc(100dvh_-_105px)] overflow-hidden pb-safe mt-2">
        <StepViewer
          key={currentStep.id}
          step={currentStep}
          steps={allSteps}
          currentIndex={currentIndex}
          completedSteps={progress.completedSteps}
          bookmarks={progress.bookmarks}
          quizAnswers={progress.quizAnswers}
          scenarioAnswers={progress.scenarioAnswers}
          onNavigate={handleSelectStep}
          onComplete={handleCompleteStep}
          onQuizAnswer={handleQuizAnswer}
          onScenarioAnswer={handleScenarioAnswer}
          onToggleBookmark={handleToggleBookmark}
        />
      </main>
    </div>
  );
}
