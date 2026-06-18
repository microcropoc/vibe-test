import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImportValidationError, parseTestJson } from '@/utils/import';
import { createLocalTestFromDefinition, saveLocalTest } from '@/utils/storage';

export function ImportPage() {
  const navigate = useNavigate();
  const [raw, setRaw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleImport() {
    setError(null);
    setSuccess(null);
    try {
      const definition = parseTestJson(raw);
      const test = createLocalTestFromDefinition(definition);
      saveLocalTest(test);
      window.dispatchEvent(new Event('storage'));
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

  return (
    <section className="guest-page">
      <h1>Импорт JSON</h1>
      <p>Вставьте JSON теста в формате из спецификации.</p>
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
