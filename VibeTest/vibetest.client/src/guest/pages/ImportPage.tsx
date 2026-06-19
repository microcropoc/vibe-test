import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImportValidationError, parseTestJson } from '@/utils/import';
import { createLocalTestFromDefinition, saveLocalTest } from '@/utils/storage';

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
      setTimeout(() => navigate('/tests'), 800);
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
    <section className="guest-page">
      <h1>Импорт JSON</h1>
      <p>Вставьте JSON теста или выберите файл.</p>

      <p>
        <label className="guest-button guest-button--ghost" style={{ cursor: 'pointer' }}>
          Выбрать файл
          <input type="file" accept=".json,application/json" hidden onChange={handleFileChange} />
        </label>
      </p>

      <textarea
        className="guest-textarea"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder='{"name":"...","questions":[...]}'
        spellCheck={false}
      />
      <p>
        <button type="button" className="guest-button" onClick={handleImport}>
          Импортировать
        </button>
      </p>
      {error && <p className="guest-error">{error}</p>}
      {success && <p className="guest-success">{success}</p>}
    </section>
  );
}
