import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import type { FlashcardStep, QuizStep, ScenarioStep, TheoryStep } from "../../types/course";
import Reader, { InlineText } from "./Reader";
import { playClick } from "../sound";

type OptState = "idle" | "selected" | "correct" | "wrong" | "dim";

const optClass: Record<OptState, string> = {
  idle: "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-slate-700/50 text-slate-800 dark:text-slate-100",
  selected: "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-600/30 text-slate-900 dark:text-white",
  correct: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30 text-slate-900 dark:text-white",
  wrong: "border-rose-500 bg-rose-50 dark:bg-rose-950/40 animate-shake text-slate-900 dark:text-white",
  dim: "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 opacity-55 text-slate-500 dark:text-slate-400",
};

const numClass: Record<OptState, string> = {
  idle: "border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300",
  selected: "border-emerald-600 bg-emerald-600 text-white",
  correct: "border-emerald-500 bg-emerald-500 text-white",
  wrong: "border-rose-500 bg-rose-500 text-white",
  dim: "border-slate-200 dark:border-slate-700 text-slate-400 bg-slate-100 dark:bg-slate-800",
};

function OptionCard({ n, text, state, disabled, onClick, delay }: { n: number; text: string; state: OptState; disabled: boolean; onClick: () => void; delay: number }) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (!disabled) playClick();
        onClick();
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 420, damping: 32 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`press flex min-h-14 w-full items-start gap-3 rounded-xl border-2 p-3.5 text-left disabled:cursor-default transition-colors ${optClass[state]}`}
    >
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-semibold transition-colors ${numClass[state]}`}>
        {state === "correct" ? <Check className="animate-pop h-4 w-4" strokeWidth={3} /> : state === "wrong" ? <X className="animate-pop h-4 w-4" strokeWidth={3} /> : n}
      </span>
      <InlineText className="pt-0.5 leading-6" text={text} />
    </motion.button>
  );
}

function Verdict({ ok, label, text }: { ok: boolean; label: string; text?: string | undefined }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className={`mt-5 overflow-hidden rounded-xl border ${
        ok
          ? "border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200"
          : "border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200"
      }`}
    >
      <div className={`flex items-center gap-2 px-4 py-2.5 font-semibold ${ok ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
        <span className={`flex h-6 w-6 items-center justify-center rounded-full ${ok ? "bg-emerald-600" : "bg-rose-600"} text-white`}>
          {ok ? <Check className="animate-pop h-3.5 w-3.5" strokeWidth={3} /> : <X className="animate-pop h-3.5 w-3.5" strokeWidth={3} />}
        </span>
        {label}
      </div>
      {text && (
        <div className="border-t border-slate-200/60 dark:border-slate-800 px-4 py-3 text-[15px] leading-7 text-slate-800 dark:text-slate-200">
          <InlineText text={text} />
        </div>
      )}
    </motion.div>
  );
}

export function Theory({ step }: { step: TheoryStep }) {
  return (
    <article>
      <span className="mb-3 inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
        Теория
      </span>
      <h1 className="mb-2 text-[1.75rem] font-bold leading-tight tracking-tight text-slate-900 dark:text-white">{step.title}</h1>
      <Reader text={step.content} />
    </article>
  );
}

export function Quiz({ step, answer, pending, exam, onPick }: { step: QuizStep; answer: number | undefined; pending: number | null; exam: boolean; onPick: (i: number) => void }) {
  const answered = answer !== undefined;
  const ok = answer === step.correctAnswer;
  const state = (i: number): OptState => {
    if (exam) {
      return pending === i ? "selected" : "idle";
    }
    if (!answered) return pending === i ? "selected" : "idle";
    if (i === step.correctAnswer) return "correct";
    if (i === answer) return "wrong";
    return "dim";
  };
  const explain = !ok && answer !== undefined && step.wrongExplanation?.[answer] ? `${step.wrongExplanation[answer]}\n\n${step.explanation}` : step.explanation;

  return (
    <div>
      <span className="mb-3 inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
        {exam ? "Экзаменационный вопрос" : "Вопрос"}
      </span>
      <InlineText className="mb-6 block text-xl font-bold leading-snug tracking-tight text-slate-900 dark:text-white sm:text-2xl" text={step.question} />
      <div className="space-y-2.5">
        {step.options.map((o, i) => (
          <OptionCard key={i} n={i + 1} text={o} state={state(i)} disabled={!exam && answered} onClick={() => onPick(i)} delay={i * 0.04} />
        ))}
      </div>
      {!exam && answered && <Verdict ok={ok} label={ok ? "Верно" : "Ошибка"} text={explain} />}
    </div>
  );
}

export function Scenario({ step, answer, pending, exam, onPick }: { step: ScenarioStep; answer: string | undefined; pending: number | null; exam: boolean; onPick: (i: number) => void }) {
  const chosen = step.options.find((o) => o.id === answer);
  const state = (i: number): OptState => {
    const o = step.options[i]!;
    if (exam) {
      return pending === i ? "selected" : "idle";
    }
    if (!chosen) return pending === i ? "selected" : "idle";
    if (o.isCorrect) return "correct";
    if (o.id === chosen.id) return "wrong";
    return "dim";
  };
  const p = step.patientInfo;

  return (
    <div>
      <div className="mb-5 flex items-center gap-3 overflow-hidden rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-white shadow-md">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xl">{p.avatarEmoji ?? "🐘"}</span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{p.name}</div>
          <div className="flex flex-wrap gap-x-3 font-mono text-xs opacity-75"><span>{p.age} лет</span><span>{p.role}</span></div>
        </div>
        <span className="shrink-0 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-950">Кейс</span>
      </div>
      <h1 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">{step.title}</h1>
      <div className="mb-5"><Reader text={step.situation} /></div>
      <div className="space-y-2.5">
        {step.options.map((o, i) => (
          <OptionCard key={o.id} n={i + 1} text={o.text} state={state(i)} disabled={!exam && !!chosen} onClick={() => onPick(i)} delay={i * 0.04} />
        ))}
      </div>
      {!exam && chosen && <Verdict ok={chosen.isCorrect} label={chosen.isCorrect ? "Принято" : "Фатально"} text={chosen.feedback} />}
    </div>
  );
}

export function Flashcards({ step, onProgress }: { step: FlashcardStep; onProgress?: (evaluatedCount: number, total: number) => void }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewedIndices, setReviewedIndices] = useState<Set<number>>(new Set());
  const [known, setKnown] = useState<number[]>([]);
  const [review, setReview] = useState<number[]>([]);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    setI(0);
    setFlipped(false);
    setReviewedIndices(new Set());
    setKnown([]);
    setReview([]);
    if (onProgress) onProgress(0, step.cards.length);
  }, [step.id]);

  const card = step.cards[i];
  const go = (d: number) => {
    playClick();
    setDir(d);
    setFlipped(false);
    setI((v) => Math.min(step.cards.length - 1, Math.max(0, v + d)));
  };

  const mark = (needReview: boolean) => {
    playClick();
    const nextReviewed = new Set(reviewedIndices);
    nextReviewed.add(i);
    setReviewedIndices(nextReviewed);

    setReview((r) => (needReview ? [...new Set([...r, i])] : r.filter((x) => x !== i)));
    setKnown((k) => (needReview ? k.filter((x) => x !== i) : [...new Set([...k, i])]));

    if (onProgress) {
      onProgress(nextReviewed.size, step.cards.length);
    }
    go(1);
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.code === "Space") {
        e.preventDefault();
        playClick();
        setFlipped((f) => !f);
      } else if (e.key === "1") {
        e.preventDefault();
        mark(true);
      } else if (e.key === "2") {
        e.preventDefault();
        mark(false);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [i, reviewedIndices]);

  if (!card) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          Карточки
        </span>
        <span className="font-mono text-sm text-slate-500 dark:text-slate-400">Термин {i + 1} из {step.cards.length}</span>
      </div>
      <h1 className="mb-3 font-semibold text-slate-900 dark:text-white">{step.title}</h1>
      <div className="mb-4 flex gap-1">
        {step.cards.map((_, ci) => (
          <span
            key={ci}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              ci === i
                ? "bg-emerald-600"
                : known.includes(ci)
                ? "bg-emerald-500"
                : review.includes(ci)
                ? "bg-rose-500"
                : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>

      <motion.div key={i} initial={{ opacity: 0, x: 40 * dir, rotate: 2 * dir }} animate={{ opacity: 1, x: 0, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 28 }}>
        <button
          type="button"
          onClick={() => {
            playClick();
            setFlipped((f) => !f);
          }}
          className="flip-scene block min-h-[300px] w-full text-left"
          aria-label="Перевернуть карту"
        >
          <div className="flip-inner relative h-full min-h-[300px] w-full" style={{ transform: flipped ? "rotateY(180deg)" : undefined }}>
            {/* Front */}
            <div
              className="flip-face absolute inset-0 flex flex-col justify-between rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center shadow-md hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors min-h-[300px]"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Термин {i + 1} из {step.cards.length}</span>
                <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-[11px] text-slate-600 dark:text-slate-300">
                  Нажмите пробел или карточку для переворота
                </span>
              </div>
              <div className="flex flex-col items-center justify-center my-auto">
                <span className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Понятие</span>
                <InlineText className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white" text={card.term} />
              </div>
              <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> Перевернуть карту
              </div>
            </div>

            {/* Back */}
            <div
              className="flip-face flip-back absolute inset-0 flex flex-col justify-between rounded-2xl border-2 border-emerald-900 dark:border-emerald-700 bg-emerald-800 dark:bg-emerald-900 p-8 text-center text-white shadow-xl min-h-[300px]"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center justify-between text-xs text-emerald-200 font-mono">
                <span>Термин {i + 1} из {step.cards.length}</span>
                <span className="rounded-full bg-emerald-950/70 px-2.5 py-1 text-[11px]">Определение</span>
              </div>
              <div className="flex flex-col items-center justify-center my-auto">
                <span className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-emerald-200">Суть</span>
                <InlineText className="text-[17px] leading-7" text={card.definition} />
              </div>
              <div className="text-center text-xs text-emerald-200 flex items-center justify-center gap-1.5">
                Оцените ниже: [1] Повторить · [2] Знаю
              </div>
            </div>
          </div>
        </button>
      </motion.div>

      <div className="mt-4 grid grid-cols-[3rem_1fr_1fr_3rem] gap-2">
        <button type="button" onClick={() => go(-1)} disabled={i === 0} className="press flex h-12 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm disabled:opacity-40"><ChevronLeft className="h-5 w-5 text-slate-700 dark:text-slate-200" /></button>
        <button type="button" onClick={() => mark(true)} className="press h-12 rounded-xl border-2 border-rose-200 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/40 text-sm font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5">
          <span className="font-mono text-xs bg-rose-200/70 dark:bg-rose-900/60 px-1.5 py-0.5 rounded text-rose-800 dark:text-rose-200">[ 1 ]</span> Повторить
        </button>
        <button type="button" onClick={() => mark(false)} className="press h-12 rounded-xl border-2 border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5">
          <span className="font-mono text-xs bg-emerald-200/70 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-800 dark:text-emerald-200">[ 2 ]</span> Знаю
        </button>
        <button type="button" onClick={() => go(1)} disabled={i === step.cards.length - 1} className="press flex h-12 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm disabled:opacity-40"><ChevronRight className="h-5 w-5 text-slate-700 dark:text-slate-200" /></button>
      </div>
    </div>
  );
}
