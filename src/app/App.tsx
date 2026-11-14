import { useEffect } from 'react';
import { LESSON_LINKS } from '../bank/lessonLinks';
import { lessonToBook } from '../bank/build';
import { mistakes } from '../test/progress';
import { Shell } from '../ui/Shell';
import { Home } from '../ui/Home';
import { TopicPage } from '../ui/TopicPage';
import { TestRunner } from '../ui/TestRunner';
import { Terms } from '../ui/Terms';
import { ListPage } from '../ui/ListPage';
import { useProgress } from '../ui/useProgress';
import { incomingHash, useRoute } from './router';

// Ссылка из библиотеки (`?book=`) или старая ссылка на урок (`?course=&lesson=`) → маршрут в hash.
// Выполняется до первого рендера, чтобы не мигала главная.
(() => {
  const target = incomingHash(window.location.search, (l) => lessonToBook(LESSON_LINKS, l));
  if (target) history.replaceState(null, '', window.location.pathname + target);
})();

export default function App() {
  const route = useRoute();
  const [progress, update] = useProgress();

  useEffect(() => {
    const titles: Record<string, string> = { home: 'Elephantorina · Research Station', list: 'Список · Elephantorina' };
    document.title = titles[route.kind] ?? 'Elephantorina';
  }, [route.kind]);

  return (
    <Shell mistakes={mistakes(progress).size}>
      {route.kind === 'home' && <Home progress={progress} update={update} />}
      {route.kind === 'book' && <TopicPage id={route.id} progress={progress} />}
      {route.kind === 'terms' && <Terms id={route.id} />}
      {route.kind === 'test' && <TestRunner route={route} progress={progress} update={update} />}
      {route.kind === 'list' && <ListPage />}
    </Shell>
  );
}
