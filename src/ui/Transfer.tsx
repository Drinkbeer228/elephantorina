import { useRef, useState } from 'react';
import { exportProgress, mergeProgress, parseExport, type Progress } from '../test/progress';
import { plural } from './common';

/** Перенос прогресса между устройствами: выгрузить в .json и загрузить обратно (с объединением). */
export function Transfer({ progress, update }: { progress: Progress; update: (fn: (p: Progress) => Progress) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const answered = Object.keys(progress.questions).length;

  const save = () => {
    const blob = new Blob([exportProgress(progress)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elephantorina-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMsg({ ok: true, text: 'Файл сохранён. Откройте его на другом устройстве кнопкой «Загрузить».' });
  };

  const load = async (file: File | undefined) => {
    if (!file) return;
    try {
      const incoming = parseExport(await file.text());
      const n = Object.keys(incoming.questions).length;
      update((p) => mergeProgress(p, incoming));
      setMsg({ ok: true, text: `Загружено: ${plural(n, 'ответ', 'ответа', 'ответов')}. Результаты объединены с этим устройством.` });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'Не удалось прочитать файл.' });
    } finally {
      if (input.current) input.current.value = '';
    }
  };

  return (
    <section className="card-soft mt-12 p-5">
      <div className="eyebrow">Прогресс</div>
      <p className="mt-2 mb-0 text-[14.5px]">
        Результаты хранятся только в этом браузере
        {answered > 0 ? ` (${plural(answered, 'вопрос', 'вопроса', 'вопросов')} с ответами)` : ''}. Чтобы перенести их на другое
        устройство, сохраните файл и загрузите его там — результаты объединятся, ничего не потеряется.
      </p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <button type="button" className="btn !min-h-10 text-[14px]" onClick={save} disabled={answered === 0 && Object.keys(progress.topics).length === 0}>
          Сохранить в файл
        </button>
        <button type="button" className="btn !min-h-10 text-[14px]" onClick={() => input.current?.click()}>
          Загрузить из файла
        </button>
        <input ref={input} type="file" accept="application/json,.json" className="hidden" onChange={(e) => load(e.target.files?.[0])} />
      </div>
      {msg && (
        <p className="mt-3 mb-0 text-[14px]" role="status" style={{ color: msg.ok ? 'var(--sage)' : 'var(--terra)' }}>
          {msg.text}
        </p>
      )}
    </section>
  );
}
