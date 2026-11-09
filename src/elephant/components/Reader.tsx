import { parseMarkdownBlocks, formatInlineHtml, type MarkdownBlock } from "../../utils/courseUtils";

const html = (t: string) => ({ __html: formatInlineHtml(t) });

function Block({ b }: { b: MarkdownBlock }) {
  switch (b.type) {
    case "heading":
      if (b.level === 2) return <h2 className="mt-10 mb-3 text-[1.35rem] font-semibold tracking-tight text-slate-900 dark:text-white">{b.text}</h2>;
      if (b.level === 3) return <h3 className="mt-6 mb-2 text-lg font-semibold text-slate-900 dark:text-white">{b.text}</h3>;
      return <h4 className="mt-5 mb-2 font-semibold text-slate-900 dark:text-white">{b.text}</h4>;
    case "paragraph":
      return <p className="my-3.5 leading-[1.8] text-slate-800 dark:text-slate-200" dangerouslySetInnerHTML={html(b.text)} />;
    case "list": {
      const items = b.items.map((it, i) => <li key={i} className="pl-1 leading-7 text-slate-800 dark:text-slate-200" dangerouslySetInnerHTML={html(it)} />);
      return b.ordered ? (
        <ol className="my-3 list-decimal space-y-1.5 pl-6 marker:font-mono marker:text-slate-400">{items}</ol>
      ) : (
        <ul className="my-3 list-disc space-y-1.5 pl-6 marker:text-slate-400">{items}</ul>
      );
    }
    case "code":
      return (
        <pre className="my-5 overflow-x-auto rounded-xl bg-slate-950 p-4 text-emerald-400 font-mono text-xs leading-relaxed border border-slate-800 shadow-md">
          <code>{b.content}</code>
        </pre>
      );
    case "table":
      return (
        <div className="surface my-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                {b.headers.map((h, i) => (
                  <th key={i} className="border-b border-slate-200 dark:border-slate-800 px-3 py-2 text-left font-semibold text-slate-900 dark:text-white" dangerouslySetInnerHTML={html(h)} />
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, ri) => (
                <tr key={ri} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  {r.map((c, ci) => (
                    <td key={ci} className="px-3 py-2 align-top tabular-nums text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={html(c)} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "callout": {
      const tone =
        b.variant === "clinical"
          ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 dark:border-amber-500/80 text-amber-950 dark:text-amber-200"
          : b.variant === "bio" || b.variant === "enrichment"
          ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-500/80 text-emerald-950 dark:text-emerald-200"
          : "border-sky-500 bg-sky-50/70 dark:bg-sky-950/30 dark:border-sky-500/80 text-sky-950 dark:text-sky-200";
      const icon = b.variant === "clinical" ? "⚠" : b.variant === "bio" || b.variant === "enrichment" ? "✦" : "ℹ";
      return (
        <div className={`my-5 rounded-xl border-l-4 px-4 py-3 shadow-sm ${tone}`}>
          <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-80 font-mono">
            <span aria-hidden>{icon}</span>{b.title}
          </p>
          {b.lines.map((l, i) => (
            <p key={i} className="my-1 leading-7 text-[15px]" dangerouslySetInnerHTML={html(l)} />
          ))}
        </div>
      );
    }
  }
}

export default function Reader({ text }: { text: string }) {
  const blocks = parseMarkdownBlocks(text);
  return (
    <div className="prose-reader text-[16px] text-slate-800 dark:text-slate-200">
      {blocks.map((b, i) => (
        <Block b={b} key={i} />
      ))}
    </div>
  );
}

export function InlineText({ text, className }: { text: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={html(text)} />;
}
