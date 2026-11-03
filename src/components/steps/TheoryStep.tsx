import { TheoryStep as TheoryStepType } from '../../types/course';
import { AlertCircle, Star, BookOpen } from 'lucide-react';

interface Props {
  step: TheoryStepType;
}

// Простой парсер markdown → React элементы
function parseMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let inList = false;
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${key++}`} className="space-y-2 my-3">
          {listItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300 leading-relaxed">
              <Star className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-1" />
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const formatInline = (str: string) => {
    return str
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-slate-100">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic text-indigo-600 dark:text-indigo-400">$1</em>')
      .replace(/\$([^$]+)\$/g, '<code class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono text-indigo-600 dark:text-indigo-400">$1</code>');
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      continue;
    }

    // Heading ###
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h-${key++}`} className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-4 mb-2">
          {trimmed.replace('### ', '')}
        </h3>
      );
      continue;
    }

    // Heading ##
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h-${key++}`} className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-4 mb-2">
          {trimmed.replace('## ', '')}
        </h2>
      );
      continue;
    }

    // Clinical guidance block
    if (trimmed === '[CLINICAL GUIDANCE]') {
      flushList();
      // Find the next non-empty lines for the guidance content
      continue;
    }

    // List item
    if (trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(trimmed.slice(2));
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${key++}`} className="text-base text-slate-600 dark:text-slate-300 leading-relaxed my-2"
        dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
      />
    );
  }

  flushList();
  return elements;
}

// Извлечение [CLINICAL GUIDANCE] блоков
function extractClinicalGuidance(text: string): string[] {
  const parts = text.split('[CLINICAL GUIDANCE]');
  const guidances: string[] = [];
  for (let i = 1; i < parts.length; i++) {
    // Берём текст до следующего заголовка или конца
    const guidanceText = parts[i].split('\n###')[0].trim();
    guidances.push(guidanceText);
  }
  return guidances;
}

// Удаление блоков [CLINICAL GUIDANCE] из основного текста
function removeClinicalGuidance(text: string): string {
  const parts = text.split('[CLINICAL GUIDANCE]');
  let result = parts[0];
  for (let i = 1; i < parts.length; i++) {
    const afterGuidance = parts[i].split('\n###');
    if (afterGuidance.length > 1) {
      result += '\n### ' + afterGuidance.slice(1).join('\n### ');
    }
  }
  return result;
}

export default function TheoryStep({ step }: Props) {
  const mainContent = removeClinicalGuidance(step.content);
  const guidances = extractClinicalGuidance(step.content);
  const parsedContent = parseMarkdown(mainContent);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
            {step.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Теоретический материал</p>
        </div>
      </div>

      {/* Main content */}
      <div className="prose-custom">
        {parsedContent}
      </div>

      {/* Clinical Guidance blocks */}
      {guidances.map((guidance, idx) => (
        <div
          key={idx}
          className="p-4 bg-amber-50/80 dark:bg-amber-900/20 rounded-2xl border-l-4 border-amber-400 dark:border-amber-500 mt-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
                [CLINICAL GUIDANCE]
              </p>
              <div
                className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed space-y-1"
                dangerouslySetInnerHTML={{
                  __html: guidance
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.+?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br/>')
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
