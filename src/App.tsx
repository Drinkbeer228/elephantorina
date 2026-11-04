import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
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
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const course = COURSES_DATA.find(c => c.id === currentCourseId) || COURSES_DATA[0];
  
  const allSteps: Step[] = course.modules.flatMap(m => 
    m.lessons.flatMap(l => l.steps)
  );

  const progress: UserProgress = progressStore[currentCourseId] 
    ? { ...progressStore[currentCourseId], currentStepId: progressStore[currentCourseId].currentStepId || allSteps[0]?.id || '' }
    : { ...createDefaultProgress(currentCourseId), currentStepId: allSteps[0]?.id || '' };

  useEffect(() => {
    saveProgress(progressStore);
  }, [progressStore]);

  useEffect(() => {
    localStorage.setItem('elephantology-current-course', currentCourseId);
  }, [currentCourseId]);

  const currentStep = allSteps.find(s => s.id === progress.currentStepId) || allSteps[0];
  const currentIndex = allSteps.findIndex(s => s.id === currentStep?.id);
  const totalSteps = allSteps.length;
  const completedCount = progress.completedSteps.length;
  const progressPercent = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  const currentLesson = course.modules.flatMap(m => m.lessons).find(l =>
    l.steps.some(s => s.id === currentStep?.id)
  );

  const lessonNumber = (() => {
    if (!currentLesson) return undefined;
    const match = currentLesson.title.match(/Урок\s+([\d.]+)/i);
    if (match) return match[1];
    const lessons = course.modules.flatMap(m => m.lessons);
    const idx = lessons.findIndex(l => l.id === currentLesson.id);
    return idx >= 0 ? String(idx + 1) : undefined;
  })();

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

  if (currentView === 'DASHBOARD') {
    return (
      <div className="min-h-screen bg-[#F8F7F4] text-[#1C1E1F]">
        <Header
          currentView="dashboard"
          courseTitle={course.title}
          progress={progressPercent}
          score={progress.score}
          onGoToDashboard={handleGoToDashboard}
        />
        <Dashboard
          courses={COURSES_DATA}
          progressStore={progressStore}
          onSelectCourse={handleSelectCourse}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1C1E1F] flex flex-col">
      <Header
        currentView="lesson"
        courseTitle={course.title}
        progress={progressPercent}
        score={progress.score}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onGoToDashboard={handleGoToDashboard}
      />

      <div className="flex flex-1 min-h-0">
        <Sidebar
          course={course}
          progress={progress}
          onSelectStep={handleSelectStep}
          onGoToDashboard={handleGoToDashboard}
          isOpen={sidebarOpen}
          onToggleOpen={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <LessonHeader
            lessonTitle={lessonTitle}
            lessonNumber={lessonNumber}
            steps={allSteps}
            currentStepId={progress.currentStepId}
            completedSteps={progress.completedSteps}
            onSelectStep={handleSelectStep}
            onBack={handleGoToDashboard}
            score={progress.score}
          />

          <StepViewer
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
    </div>
  );
}
