import { useState, useEffect, useCallback, useMemo } from 'react';
import Header, { DashboardSection } from './components/Header';
import Sidebar from './components/Sidebar';
import LessonHeader from './components/LessonHeader';
import StepViewer from './components/StepViewer';
import Dashboard from './components/Dashboard';
import { COURSES_DATA } from './data/coursesData';
import { UserProgress } from './types/course';
import { getLessonContext, computeGlobalStats } from './utils/courseUtils';

const STORAGE_KEY = 'elephantology-edu-progress';

interface ProgressStore {
  [courseId: string]: UserProgress;
}

type ViewType = 'DASHBOARD' | 'LESSON';

function loadProgress(): ProgressStore {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
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
    lastActivity: new Date().toISOString(),
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
  const [dashboardSection, setDashboardSection] = useState<DashboardSection>('catalog');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const course = useMemo(
    () => COURSES_DATA.find((c) => c.id === currentCourseId) || COURSES_DATA[0],
    [currentCourseId]
  );

  const allCourseSteps = useMemo(
    () => course.modules.flatMap((m) => m.lessons.flatMap((l) => l.steps)),
    [course]
  );

  const progress: UserProgress = useMemo(() => {
    const existing = progressStore[course.id];
    const fallbackStepId = allCourseSteps[0]?.id || '';
    if (!existing) {
      return {
        ...createDefaultProgress(course.id),
        currentStepId: fallbackStepId,
      };
    }
    const validStep = allCourseSteps.some((s) => s.id === existing.currentStepId)
      ? existing.currentStepId
      : fallbackStepId;
    return {
      ...createDefaultProgress(course.id),
      ...existing,
      completedSteps: Array.isArray(existing.completedSteps) ? existing.completedSteps : [],
      bookmarks: Array.isArray(existing.bookmarks) ? existing.bookmarks : [],
      quizAnswers: existing.quizAnswers || {},
      scenarioAnswers: existing.scenarioAnswers || {},
      currentStepId: validStep,
    };
  }, [progressStore, course.id, allCourseSteps]);

  useEffect(() => {
    saveProgress(progressStore);
  }, [progressStore]);

  useEffect(() => {
    try {
      localStorage.setItem('elephantology-current-course', currentCourseId);
    } catch {
      // Ignore storage quota errors
    }
  }, [currentCourseId]);

  const lessonCtx = useMemo(
    () => getLessonContext(course, progress.currentStepId),
    [course, progress.currentStepId]
  );

  const globalStats = useMemo(
    () => computeGlobalStats(COURSES_DATA, progressStore),
    [progressStore]
  );

  const currentStep =
    allCourseSteps.find((s) => s.id === progress.currentStepId) || allCourseSteps[0];

  const updateCourseProgress = useCallback(
    (targetCourseId: string, updater: (prev: UserProgress) => UserProgress) => {
      setProgressStore((prev) => {
        const targetCourse =
          COURSES_DATA.find((c) => c.id === targetCourseId) || COURSES_DATA[0];
        const firstStep =
          targetCourse.modules[0]?.lessons[0]?.steps[0]?.id || '';
        const base = prev[targetCourseId] || {
          ...createDefaultProgress(targetCourseId),
          currentStepId: firstStep,
        };
        return {
          ...prev,
          [targetCourseId]: updater(base),
        };
      });
    },
    []
  );

  const handleSelectStep = useCallback(
    (stepId: string) => {
      updateCourseProgress(course.id, (prev) => ({
        ...prev,
        currentStepId: stepId,
        lastActivity: new Date().toISOString(),
      }));
    },
    [course.id, updateCourseProgress]
  );

  const handleCompleteStep = useCallback(() => {
    if (!currentStep) return;
    updateCourseProgress(course.id, (prev) => {
      if (prev.completedSteps.includes(currentStep.id)) return prev;
      return {
        ...prev,
        completedSteps: [...prev.completedSteps, currentStep.id],
        score: (prev.score || 0) + 10,
        lastActivity: new Date().toISOString(),
      };
    });
  }, [course.id, currentStep, updateCourseProgress]);

  const handleQuizAnswer = useCallback(
    (stepId: string, answerIndex: number) => {
      updateCourseProgress(course.id, (prev) => ({
        ...prev,
        quizAnswers: { ...prev.quizAnswers, [stepId]: answerIndex },
        lastActivity: new Date().toISOString(),
      }));
    },
    [course.id, updateCourseProgress]
  );

  const handleScenarioAnswer = useCallback(
    (stepId: string, optionId: string) => {
      updateCourseProgress(course.id, (prev) => ({
        ...prev,
        scenarioAnswers: { ...prev.scenarioAnswers, [stepId]: optionId },
        lastActivity: new Date().toISOString(),
      }));
    },
    [course.id, updateCourseProgress]
  );

  const handleToggleBookmarkInCourse = useCallback(
    (targetCourseId: string, stepId: string) => {
      updateCourseProgress(targetCourseId, (prev) => {
        const bookmarks = prev.bookmarks.includes(stepId)
          ? prev.bookmarks.filter((id) => id !== stepId)
          : [...prev.bookmarks, stepId];
        return { ...prev, bookmarks, lastActivity: new Date().toISOString() };
      });
    },
    [updateCourseProgress]
  );

  const handleSelectCourse = useCallback(
    (courseId: string, optionalStepId?: string) => {
      setCurrentCourseId(courseId);
      if (optionalStepId) {
        updateCourseProgress(courseId, (prev) => ({
          ...prev,
          currentStepId: optionalStepId,
          lastActivity: new Date().toISOString(),
        }));
      }
      setCurrentView('LESSON');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [updateCourseProgress]
  );

  const handleGoToDashboard = useCallback(() => {
    setCurrentView('DASHBOARD');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (currentView === 'DASHBOARD') {
    return (
      <div className="min-h-screen bg-[#FBF9F5] text-[#181A18]">
        <Header
          currentView="dashboard"
          activeSection={dashboardSection}
          bookmarksCount={globalStats.bookmarksCount}
          onNavigateSection={(sec) => {
            setDashboardSection(sec);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onGoToDashboard={handleGoToDashboard}
          onResumeLesson={() => setCurrentView('LESSON')}
        />
        <Dashboard
          courses={COURSES_DATA}
          progressStore={progressStore}
          activeSection={dashboardSection}
          onChangeSection={(sec) => {
            setDashboardSection(sec);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectCourse={handleSelectCourse}
          onToggleBookmark={handleToggleBookmarkInCourse}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#181A18] flex flex-col">
      <Header
        currentView="lesson"
        activeSection={dashboardSection}
        bookmarksCount={globalStats.bookmarksCount}
        onNavigateSection={(sec) => {
          setDashboardSection(sec);
          setCurrentView('DASHBOARD');
        }}
        onGoToDashboard={handleGoToDashboard}
      />

      <div className="flex flex-1 min-h-0">
        <Sidebar
          courses={COURSES_DATA}
          course={course}
          progress={progress}
          onSelectCourse={(cId) => handleSelectCourse(cId)}
          onSelectStep={handleSelectStep}
          onGoToDashboard={handleGoToDashboard}
          isOpen={sidebarOpen}
          onToggleOpen={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 flex flex-col min-w-0">
          <LessonHeader
            courseTitle={course.title}
            moduleTitle={lessonCtx.currentModule.title}
            lessonTitle={lessonCtx.cleanLessonTitle}
            lessonNumber={lessonCtx.lessonNumber}
            steps={lessonCtx.lessonSteps}
            currentStepId={progress.currentStepId}
            completedSteps={progress.completedSteps}
            onSelectStep={handleSelectStep}
            onBack={handleGoToDashboard}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          <StepViewer
            step={currentStep}
            courseSteps={lessonCtx.courseSteps}
            courseStepIndex={lessonCtx.courseStepIndex}
            lessonSteps={lessonCtx.lessonSteps}
            lessonStepIndex={lessonCtx.lessonStepIndex}
            completedSteps={progress.completedSteps}
            bookmarks={progress.bookmarks}
            quizAnswers={progress.quizAnswers}
            scenarioAnswers={progress.scenarioAnswers}
            onNavigate={handleSelectStep}
            onComplete={handleCompleteStep}
            onQuizAnswer={handleQuizAnswer}
            onScenarioAnswer={handleScenarioAnswer}
            onToggleBookmark={(stepId) => handleToggleBookmarkInCourse(course.id, stepId)}
            onFinishCourse={handleGoToDashboard}
          />
        </main>
      </div>
    </div>
  );
}
