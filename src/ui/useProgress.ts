import { useCallback, useEffect, useState } from 'react';
import { loadProgress, saveProgress, PROGRESS_KEY, type Progress } from '../test/progress';
import { writeStationSummary } from '../app/stationProgress';

/** Прогресс из localStorage; синхронизируется между вкладками. */
export function useProgress(): [Progress, (fn: (p: Progress) => Progress) => void] {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());

  // Сводка для формуляра станции — и для уже накопленных результатов.
  useEffect(() => writeStationSummary(progress), [progress]);

  useEffect(() => {
    const on = (e: StorageEvent) => {
      if (e.key === PROGRESS_KEY) setProgress(loadProgress());
    };
    window.addEventListener('storage', on);
    return () => window.removeEventListener('storage', on);
  }, []);

  const update = useCallback((fn: (p: Progress) => Progress) => {
    setProgress((prev) => {
      const next = fn(prev);
      saveProgress(next);
      return next;
    });
  }, []);

  return [progress, update];
}
