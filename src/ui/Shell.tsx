import type { ReactNode } from 'react';
import { STATION_URL } from '../app/station';
import { EMBEDDED, requestClose } from '../app/embed';
import { Icon, Link } from './common';

export function Shell({ children, mistakes }: { children: ReactNode; mistakes: number }) {
  return (
    <>
      <header className="bar">
        <div className="wrap bar-in">
          <Link to={{ kind: 'home' }} className="pill brand" aria-label="Elephantorina — на главную">
            <span className="brand-mark" />
            Elephantorina
          </Link>
          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            {mistakes > 0 && (
              <Link to={{ kind: 'test', scope: 'mistakes', mode: 'practice' }} className="pill quiet" >
                <span className="tag bad num">{mistakes}</span>
                <span className="hidden sm:inline">Ошибки</span>
              </Link>
            )}
            <Link to={{ kind: 'list' }} className="pill quiet">
              <Icon name="list" size={17} />
              <span className="hidden sm:inline">Список</span>
            </Link>
            {EMBEDDED ? (
              // Внутри станции: станция сама закрывает свой «планшет».
              <button type="button" onClick={requestClose} className="pill" aria-label="Вернуться на станцию">
                <Icon name="arrow-left" size={16} />
                <span className="hidden min-[400px]:inline">Станция</span>
              </button>
            ) : (
              <a href={STATION_URL} className="pill" aria-label="Вернуться на станцию">
                <Icon name="arrow-left" size={16} />
                <span className="hidden min-[400px]:inline">Станция</span>
              </a>
            )}
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
