import { TheoryStep as TheoryStepType } from '../../types/course';
import { BookOpen, Sparkles, AlertCircle, Compass } from 'lucide-react';

interface Props {
  step: TheoryStepType;
}

// Парсер markdown со специальными биологическими блоками в стиле Tactile Bio-Minimalism
function parseMarkdown(text: any) {
  if (typeof text !== 'string') text = String(text || '');
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let inList = false;
  let listItems: string[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${key++}`} className="space-y-2.5 my-4">
          {listItems.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[#1C1E1F] leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E5A44] shrink-0 mt-2.5" />
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const formatInline = (str: any) => {
    if (typeof str !== 'string') return String(str || '');
    return str
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[#1C1E1F]">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic text-[#2E5A44]">$1</em>')
      .replace(/\$([^$]+)\$/g, '<code class="px-1.5 py-0.5 bg-[#F8F7F4] border border-[#E6E4DD] rounded text-sm font-mono text-[#2E5A44]">$1</code>');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = typeof lines[i] === 'string' ? lines[i] : String(lines[i] || '');
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushList();
        elements.push(
          <pre key={`code-${key++}`} className="my-4 p-4 bg-[#F8F7F4] border border-[#E6E4DD] rounded-xl overflow-x-auto text-xs font-mono text-[#2E5A44] leading-relaxed">
            <code>{codeBlockLines.join('\n')}</code>
          </pre>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    if (!trimmed) {
      flushList();
      continue;
    }

    // Обработка блоков callout: [BIO NOTE], [BEHAVIOR CUE], [ENRICHMENT IDEA], [CLINICAL GUIDANCE]
    const VALID_CALLOUTS = ['CLINICAL GUIDANCE', 'BIO NOTE', 'BEHAVIOR CUE', 'ENRICHMENT IDEA'];
    if (trimmed.startsWith('[') && trimmed.endsWith(']') && VALID_CALLOUTS.includes(trimmed.slice(1, -1))) {
      flushList();
      const tag = trimmed.slice(1, -1);
      let contentLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== '' && !lines[i].trim().startsWith('[')) {
        contentLines.push(lines[i]);
        i++;
      }
      i--; // откатываем шаг назад
      const contentText = contentLines.join('\n').trim();

      let calloutClass = 'callout-bio-note';
      let icon = <Sparkles className="w-5 h-5 text-[#2E5A44] shrink-0 mt-0.5" />;
      let title = 'Биология и анатомия';

      if (tag === 'BEHAVIOR CUE') {
        calloutClass = 'callout-behavior-cue';
        icon = <Compass className="w-5 h-5 text-[#C86D51] shrink-0 mt-0.5" />;
        title = 'Язык тела и поведение';
      } else if (tag === 'ENRICHMENT IDEA') {
        calloutClass = 'callout-enrichment-idea';
        icon = <BookOpen className="w-5 h-5 text-[#606462] shrink-0 mt-0.5" />;
        title = 'Среда и когнитивная нагрузка';
      } else if (tag === 'CLINICAL GUIDANCE') {
        calloutClass = 'callout-bio-note';
        icon = <AlertCircle className="w-5 h-5 text-[#2E5A44] shrink-0 mt-0.5" />;
        title = 'Клиническая рекомендация';
      }

      elements.push(
        <div key={`callout-${key++}`} className={`my-5 p-4 rounded-2xl ${calloutClass} shadow-xs`}>
          <div className="flex items-start gap-3">
            {icon}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                {title}
              </p>
              <div
                className="text-sm text-[#1C1E1F] leading-relaxed space-y-1"
                dangerouslySetInnerHTML={{
                  __html: formatInline(contentText)
                }}
              />
            </div>
          </div>
        </div>
      );
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h-${key++}`} className="text-lg font-bold text-[#1C1E1F] mt-6 mb-3">
          {trimmed.replace('### ', '')}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h-${key++}`} className="text-xl font-bold text-[#1C1E1F] mt-6 mb-3">
          {trimmed.replace('## ', '')}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(trimmed.slice(2));
      continue;
    }

    flushList();
    elements.push(
      <p key={`p-${key++}`} className="text-base text-[#606462] leading-relaxed my-3"
        dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
      />
    );
  }

  flushList();
  return elements;
}

export default function TheoryStep({ step }: Props) {
  const parsedContent = parseMarkdown(step.content);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 bg-white border border-[#E6E4DD] rounded-2xl p-6 sm:p-8 shadow-xs">
      {/* Title */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#E6E4DD]">
        <div className="w-10 h-10 rounded-xl bg-[#2E5A44]/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-[#2E5A44]" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1C1E1F]">
            {step.title}
          </h2>
          <p className="text-sm text-[#606462]">Теоретический материал</p>
        </div>
      </div>

      {/* Main content */}
      <div className="space-y-2">
        {parsedContent}
      </div>
    </div>
  );
}
