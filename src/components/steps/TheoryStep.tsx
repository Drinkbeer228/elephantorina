import { AlertCircle, Lightbulb, Star } from 'lucide-react';
import { TheoryStep as TheoryStepType } from '../../types/course';

interface Props {
  step: TheoryStepType;
}

export default function TheoryStep({ step }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
          <span className="text-xl">📖</span>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
            {step.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Теоретический материал</p>
        </div>
      </div>

      {/* Sections */}
      {step.sections.map((section, idx) => (
        <div key={idx} className="space-y-4">
          {/* Section heading */}
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {section.heading}
          </h3>

          {/* Main text */}
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {section.text}
          </p>

          {/* Highlights */}
          {section.highlights && section.highlights.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {section.highlights.map((highlight, hIdx) => (
                <div
                  key={hIdx}
                  className="flex items-start gap-2 p-3 bg-indigo-50/80 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50"
                >
                  <Star className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-indigo-700 dark:text-indigo-300">{highlight}</span>
                </div>
              ))}
            </div>
          )}

          {/* Clinical Guidance */}
          {section.clinicalGuidance && (
            <div className="p-4 bg-amber-50/80 dark:bg-amber-900/20 rounded-2xl border-l-4 border-amber-400 dark:border-amber-500">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                    [CLINICAL GUIDANCE]
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                    {section.clinicalGuidance}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Facts */}
          {section.facts && section.facts.length > 0 && (
            <div className="p-4 bg-emerald-50/80 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Интересные факты
                </span>
              </div>
              <ul className="space-y-2">
                {section.facts.map((fact, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                    <span className="text-emerald-400 dark:text-emerald-500 mt-0.5">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
