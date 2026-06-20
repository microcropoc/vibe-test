import { useState, type ChangeEvent } from 'react';
import type { QuestionDefinition } from '@/types';
import { ImportValidationError, parseQuestionsJson } from '@/utils/import';

export interface TestImportPanelProps {
  onAppend: (questions: QuestionDefinition[]) => void;
}

export function TestImportPanel({ onAppend }: TestImportPanelProps) {
  const [raw, setRaw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleAppend() {
    setError(null);
    setSuccess(null);
    try {
      const questions = parseQuestionsJson(raw);
      onAppend(questions);
      setSuccess(
        questions.length === 1
          ? 'Добавлен 1 вопрос'
          : `Добавлено ${questions.length} вопросов`,
      );
      setRaw('');
    } catch (e) {
      if (e instanceof ImportValidationError) {
        setError(e.message);
      } else {
        setError('Не удалось разобрать JSON');
      }
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRaw(String(reader.result ?? ''));
      setError(null);
      setSuccess(null);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <details className="vt-import-panel">
      <summary className="vt-import-panel__summary">Импорт вопросов из JSON</summary>
      <div className="vt-import-panel__body">
        <p className="vt-muted">
          Вставьте JSON с массивом <code>questions</code> или полный тест — название и описание
          игнорируются.
        </p>

        <p>
          <label className="vt-btn vt-btn--ghost vt-import-panel__file-label">
            Выбрать файл
            <input type="file" accept=".json,application/json" hidden onChange={handleFileChange} />
          </label>
        </p>

        <div className="vt-field">
          <label htmlFor="import-json">JSON</label>
          <textarea
            id="import-json"
            className="vt-import-panel__textarea"
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value);
              setError(null);
              setSuccess(null);
            }}
            placeholder='{"questions":[{"text":"...","answers":["...","..."],"correct":0}]}'
            spellCheck={false}
          />
        </div>

        <div className="vt-actions vt-import-panel__actions">
          <button type="button" className="vt-btn" onClick={handleAppend}>
            Добавить вопросы
          </button>
        </div>

        {error && <p className="vt-error">{error}</p>}
        {success && <p className="vt-import-panel__success">{success}</p>}
      </div>
    </details>
  );
}
