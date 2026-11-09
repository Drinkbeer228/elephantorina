import { useEffect, useRef } from "react";
import { Flame, Trophy, X, Volume2, VolumeX, Sun, Moon } from "lucide-react";
import type { Step, UserProgress } from "../../types/course";
import { getStepStatus } from "../progress";

const dotClass = {
  idle: "bg-slate-200 dark:bg-slate-700",
  done: "bg-emerald-500",
  correct: "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]",
  wrong: "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]",
} as const;

interface Props {
  steps: Step[] | null;
  currentStepId: string | null;
  progress: UserProgress | undefined;
  score: number;
  mistakes: number;
  streak: number;
  soundEnabled: boolean;
  isDark: boolean;
  isExamMode?: boolean;
  examAnsweredMap?: Record<string, boolean>;
  onToggleSound: () => void;
  onToggleDark: () => void;
  onSelectStep: (id: string) => void;
  onHome: () => void;
}

export default function TopBar(p: Props) {
  const ribbon = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ribbon.current?.querySelector("[data-current]")?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [p.currentStepId]);

  const showRibbon = p.steps && p.currentStepId !== null;
  const done = showRibbon
    ? p.isExamMode
      ? Object.values(p.examAnsweredMap || {}).filter(Boolean).length
      : p.steps!.filter((s) => getStepStatus(s, p.progress) !== "idle").length
    : 0;
  const pct = showRibbon && p.steps?.length ? (done / p.steps.length) * 100 : 0;

  const Ribbon = showRibbon && p.steps && (
    <div className="min-w-0 max-w-xs flex-1 hidden md:block">
      <div ref={ribbon} className="no-scrollbar flex items-center justify-center gap-[3px] overflow-x-auto px-1 py-1">
        {p.steps.map((s, i) => {
          const cur = s.id === p.currentStepId;
          let colorClass: string;

          if (p.isExamMode) {
            const isAnswered = !!p.examAnsweredMap?.[s.id];
            colorClass = isAnswered ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700";
          } else {
            const st = getStepStatus(s, p.progress);
            colorClass = dotClass[st];
          }

          return (
            <button
              key={s.id}
              type="button"
              title={`${i + 1}. ${s.title}`}
              onClick={() => p.onSelectStep(s.id)}
              data-current={cur || undefined}
              className="group flex h-5 shrink-0 items-center px-[1px]"
            >
              <span className={`block h-2 rounded-full transition-all duration-300 group-hover:scale-125 ${cur ? "dot-current w-6 bg-emerald-600" : `w-2 ${colorClass}`}`} />
            </button>
          );
        })}
      </div>
      <div className="mx-1 h-[2px] overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="bg-emerald-600 h-full rounded-full transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-30 h-13 border-b border-slate-200/80 dark:border-white/[0.06] bg-white/85 dark:bg-[#090d16]/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-full max-w-4xl items-center justify-between px-4 sm:px-6 gap-3">
        {/* Left: Brand */}
        <button type="button" onClick={p.onHome} className="press flex shrink-0 items-center gap-2.5 text-left">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-sm text-emerald-600 dark:text-emerald-400">
            🐘
          </span>
          <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
            Слонология
          </span>
        </button>

        {/* Center: Step Ribbon (only when inside step/exam) */}
        {Ribbon}

        {/* Right: Scores & Controls */}
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="flex items-center gap-2 rounded-lg bg-slate-100/80 dark:bg-slate-900/80 px-2.5 py-1 font-mono text-xs tabular-nums font-medium text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-white/[0.06]">
            {p.streak >= 2 && (
              <span key={p.streak} className="animate-pop inline-flex items-center gap-1 text-amber-600 dark:text-amber-400" title="Серия верных ответов">
                <Flame className="h-3.5 w-3.5" />{p.streak}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400" title="Очки">
              <Trophy className="h-3.5 w-3.5" />{p.score}
            </span>
            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400" title="Ошибки">
              <X className="h-3.5 w-3.5" />{p.mistakes}
            </span>
          </div>

          <button
            type="button"
            onClick={p.onToggleSound}
            aria-label={p.soundEnabled ? "Выключить звук" : "Включить звук"}
            title={p.soundEnabled ? "Звук включен" : "Звук выключен"}
            className="press flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            {p.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 opacity-50" />}
          </button>

          <button
            type="button"
            onClick={p.onToggleDark}
            aria-label={p.isDark ? "Светлая тема" : "Тёмная тема"}
            title={p.isDark ? "Светлая тема" : "Тёмная тема"}
            className="press flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            {p.isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
