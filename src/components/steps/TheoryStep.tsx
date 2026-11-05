import { TheoryStep as TheoryStepType } from '../../types/course';
import { BookOpen, AlertCircle, Compass, Microscope, Sparkles } from 'lucide-react';
import { parseMarkdownBlocks, formatInlineHtml, MarkdownBlock } from '../../utils/courseUtils';

interface Props {
  step: TheoryStepType;
}

function renderBlock(block: MarkdownBlock, idx: number) {
  switch (block.type) {
    case 'heading': {
      if (block.level === 2) {
        return (
          <h2
            key={`h2-${idx}`}
            className="font-display text-2xl sm:text-3xl font-bold text-[#181A18] mt-8 mb-3 tracking-tight border-b border-[#E4DFD3] pb-2"
            style={{ textWrap: 'balance' }}
          >
            {block.text}
          </h2>
        );
      }
      if (block.level === 3) {
        return (
          <h3
            key={`h3-${idx}`}
            className="font-display text-xl sm:text-2xl font-bold text-[#181A18] mt-7 mb-2.5 tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            {block.text}
          </h3>
        );
      }
      return (
        <h4
          key={`h4-${idx}`}
          className="text-base sm:text-lg font-bold text-[#1E4631] mt-6 mb-2"
        >
          {block.text}
        </h4>
      );
    }

    case 'paragraph':
      return (
        <p
          key={`p-${idx}`}
          className="text-[15.5px] sm:text-base text-[#2C302D] leading-[1.75] my-3.5 max-w-[72ch]"
          dangerouslySetInnerHTML={{ __html: formatInlineHtml(block.text) }}
        />
      );

    case 'list': {
      if (block.ordered) {
        return (
          <ol key={`ol-${idx}`} className="space-y-3 my-4 pl-1">
            {block.items.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3.5 text-[15.5px] sm:text-base text-[#2C302D] leading-[1.7] max-w-[72ch]"
              >
                <span className="font-mono-code text-xs font-semibold text-[#1E4631] bg-[#F3EFE6] border border-[#E4DFD3] rounded w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="flex-1"
                  dangerouslySetInnerHTML={{ __html: formatInlineHtml(item) }}
                />
              </li>
            ))}
          </ol>
        );
      }

      return (
        <ul key={`ul-${idx}`} className="space-y-2.5 my-4 pl-1">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-[15.5px] sm:text-base text-[#2C302D] leading-[1.7] max-w-[72ch]"
            >
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 rounded-full bg-[#1E4631] shrink-0 mt-2.5"
              />
              <span
                className="flex-1"
                dangerouslySetInnerHTML={{ __html: formatInlineHtml(item) }}
              />
            </li>
          ))}
        </ul>
      );
    }

    case 'code':
      return (
        <div
          key={`code-${idx}`}
          className="my-6 rounded-xl bg-[#F3EFE6]/90 border border-[#D8D2C2] overflow-hidden"
        >
          <div className="px-4 py-2 bg-[#EAE4D6] border-b border-[#D8D2C2] flex items-center justify-between text-xs text-[#5C615D]">
            <span className="font-medium">Структурная схема / Каскад процессов</span>
            <span className="font-mono-code text-[11px]">FIG. MONOGRAPH</span>
          </div>
          <pre className="p-4 sm:p-5 overflow-x-auto text-xs sm:text-[13px] font-mono-code text-[#181A18] leading-relaxed">
            <code>{block.content}</code>
          </pre>
        </div>
      );

    case 'table':
      return (
        <div
          key={`tbl-${idx}`}
          className="my-6 overflow-x-auto rounded-xl border border-[#D8D2C2] bg-white"
        >
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#F3EFE6] border-b border-[#D8D2C2]">
                {block.headers.map((header, hIdx) => (
                  <th
                    key={hIdx}
                    className="py-3 px-4 font-semibold text-[#181A18] text-xs uppercase tracking-wider"
                    dangerouslySetInnerHTML={{ __html: formatInlineHtml(header) }}
                  />
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DFD3]">
              {block.rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={rIdx % 2 === 0 ? 'bg-white' : 'bg-[#FBF9F5]/60'}
                >
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className="py-3 px-4 text-[#2C302D] leading-relaxed tabular-nums align-top"
                      dangerouslySetInnerHTML={{ __html: formatInlineHtml(cell) }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'callout': {
      let surfaceStyle = 'bg-[#F4F7F4] border-[#C6D6CB]';
      let headerColor = 'text-[#1E4631]';
      let icon = <AlertCircle className="w-4 h-4 text-[#1E4631] shrink-0" />;

      if (block.variant === 'paleo') {
        surfaceStyle = 'bg-[#F8F3EC] border-[#DECBB3]';
        headerColor = 'text-[#8C4A23]';
        icon = <Microscope className="w-4 h-4 text-[#8C4A23] shrink-0" />;
      } else if (block.variant === 'behavior') {
        surfaceStyle = 'bg-[#F9F4EE] border-[#E0C8B0]';
        headerColor = 'text-[#9A4B26]';
        icon = <Compass className="w-4 h-4 text-[#9A4B26] shrink-0" />;
      } else if (block.variant === 'enrichment') {
        surfaceStyle = 'bg-[#F3EFE6] border-[#D8D2C2]';
        headerColor = 'text-[#4A4E4B]';
        icon = <BookOpen className="w-4 h-4 text-[#4A4E4B] shrink-0" />;
      } else if (block.variant === 'bio') {
        surfaceStyle = 'bg-[#F4F7F4] border-[#C6D6CB]';
        headerColor = 'text-[#1E4631]';
        icon = <Sparkles className="w-4 h-4 text-[#1E4631] shrink-0" />;
      }

      return (
        <aside
          key={`callout-${idx}`}
          className={`my-6 p-5 rounded-xl border ${surfaceStyle}`}
        >
          <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-black/10">
            {icon}
            <span className={`text-xs font-bold tracking-wider uppercase ${headerColor}`}>
              {block.title}
            </span>
          </div>
          <div className="space-y-2 text-sm sm:text-[15px] text-[#181A18] leading-relaxed">
            {block.lines.map((line, lIdx) => (
              <p
                key={lIdx}
                dangerouslySetInnerHTML={{ __html: formatInlineHtml(line) }}
              />
            ))}
          </div>
        </aside>
      );
    }
  }
}

export default function TheoryStep({ step }: Props) {
  const blocks = parseMarkdownBlocks(step.content);

  return (
    <article className="animate-in bg-white border border-[#E4DFD3] rounded-2xl p-6 sm:p-10">
      {/* Editorial Monograph Header */}
      <header className="pb-6 mb-6 border-b border-[#E4DFD3]">
        <div className="flex items-center gap-2 text-xs font-medium text-[#5C615D] mb-2">
          <span>Академическая монография</span>
          <span aria-hidden="true">·</span>
          <span>Теоретический раздел</span>
        </div>
        <h1
          className="font-display text-2xl sm:text-4xl font-bold text-[#181A18] leading-tight tracking-tight"
          style={{ textWrap: 'balance' }}
        >
          {step.title}
        </h1>
      </header>

      {/* Main Structured Scientific Prose */}
      <div className="space-y-1">{blocks.map((b, idx) => renderBlock(b, idx))}</div>
    </article>
  );
}
