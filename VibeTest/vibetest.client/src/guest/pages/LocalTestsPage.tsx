import { useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { deleteLocalTest, getLocalTests } from '@/utils/storage';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function LocalTestsPage() {
  const tests = useSyncExternalStore(subscribe, getLocalTests, getLocalTests);

  return (
    <section className="guest-page">
      <h1>Мои тесты</h1>
      <p>Локальные тесты из браузера. Прохождение и редактор — на следующих этапах.</p>

      {tests.length === 0 ? (
        <div className="guest-empty">
          Пока нет сохранённых тестов.{' '}
          <Link to="/editor">Создайте первый</Link> или <Link to="/import">импортируйте JSON</Link>.
        </div>
      ) : (
        <ul className="guest-list">
          {tests.map((test) => (
            <li key={test.id} className="guest-list__item">
              <div>
                <div className="guest-list__title">{test.name}</div>
                <div className="guest-list__meta">
                  {test.questions.length} вопр. · обновлён{' '}
                  {new Date(test.updatedAt).toLocaleString()}
                </div>
              </div>
              <button
                type="button"
                className="guest-button guest-button--danger"
                onClick={() => {
                  deleteLocalTest(test.id);
                  window.dispatchEvent(new Event('storage'));
                }}
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
