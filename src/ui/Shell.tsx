import type { ReactNode } from 'react';
import { STATION_URL } from '../app/station';
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
          <div className="ml-auto flex items-center gap-1">
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
            <a href={STATION_URL} className="pill">
              <Icon name="arrow-left" size={16} />
              Станция
            </a>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
