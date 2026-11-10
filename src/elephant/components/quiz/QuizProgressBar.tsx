import { motion } from "framer-motion";
import { Timer, Trophy } from "lucide-react";

interface Props {
  index: number;
  total: number;
  score: number;
  elapsedMs: number;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function QuizProgressBar({ index, total, score, elapsedMs }: Props) {
  const percent = total === 0 ? 0 : ((index + 1) / total) * 100;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
          Вопрос {index + 1} из {total}
        </span>
        <div className="flex items-center gap-3 font-mono tabular-nums text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1" title="Время прохождения">
            <Timer className="h-3.5 w-3.5" aria-hidden="true" />
            {formatElapsed(elapsedMs)}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400" title="Очки">
            <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
            {score}
          </span>
        </div>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <motion.div
          className="h-full rounded-full bg-emerald-500"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 26 }}
        />
      </div>
    </div>
  );
}
