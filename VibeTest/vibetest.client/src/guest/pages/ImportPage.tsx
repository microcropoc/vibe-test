import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { localTestsListPath } from '@/utils/appPaths';
import { ImportValidationError, parseTestJson } from '@/utils/import';
import {
  buttonClassName,
  errorClassName,
  pageClassName,
  successClassName,
  textareaClassName,
} from '@/utils/pageShell';
import { createLocalTestFromDefinition, saveLocalTest } from '@/utils/storage';
import '@/guest/components/layout/GuestLayout.css';

export function ImportPage() {
  const navigate = useNavigate();
  const [raw, setRaw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function importDefinition(text: string) {
    setError(null);
    setSuccess(null);
    try {
      const definition = parseTestJson(text);
      const test = createLocalTestFromDefinition(definition);
      saveLocalTest(test);
      setSuccess(`Тест «${test.name}» сохранён локально.`);
      setTimeout(() => navigate(localTestsListPath()), 800);
    } catch (e) {
      if (e instanceof ImportValidationError) {
        setError(e.message);
      } else {
        setError('Не удалось импортировать тест');
      }
    }
  }

  function handleImport() {
    importDefinition(raw);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      setRaw(text);
      importDefinition(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <section className={pageClassName()}>
      <h1>Импорт JSON</h1>
      <p>Вставьте JSON теста или выберите файл.</p>

      <p>
        <label className={buttonClassName('ghost')} style={{ cursor: 'pointer' }}>
          Выбрать файл
          <input type="file" accept=".json,application/json" hidden onChange={handleFileChange} />
        </label>
      </p>

      <textarea
        className={textareaClassName()}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder='{"name":"...","questions":[...]}'
        spellCheck={false}
      />
      <p>
        <button type="button" className={buttonClassName()} onClick={handleImport}>
          Импортировать
        </button>
      </p>
      {error && <p className={errorClassName()}>{error}</p>}
      {success && <p className={successClassName()}>{success}</p>}
    </section>
  );
}
