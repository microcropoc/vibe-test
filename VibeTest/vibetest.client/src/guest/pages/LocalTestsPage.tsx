import { useMemo, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { isFullMode } from '@/config/env';
import type { LocalTest } from '@/types';
import { deleteLocalTest, getLocalTestsSnapshot } from '@/utils/storage';
import '@/guest/components/layout/GuestLayout.css';

function subscribe(callback: () => void) {
  const handler = () => callback();
  window.addEventListener('storage', handler);
  window.addEventListener('vibetest-storage', handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('vibetest-storage', handler);
  };
}

export function LocalTestsPage() {
  const raw = useSyncExternalStore(subscribe, getLocalTestsSnapshot, getLocalTestsSnapshot);
  const tests = useMemo(() => JSON.parse(raw) as LocalTest[], [raw]);

  return (
    <section className={isFullMode ? 'full-page' : 'guest-page'}>
      <h1>Мои тесты</h1>
      <p>Локальные тесты из браузера.</p>

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
              <div className="guest-list__actions">
                <Link to={`/play/${test.id}`} className="guest-button">
                  Пройти
                </Link>
                <Link to={`/editor/${test.id}`} className="guest-button guest-button--ghost">
                  Редактировать
                </Link>
                <button
                  type="button"
                  className="guest-button guest-button--danger"
                  onClick={() => deleteLocalTest(test.id)}
                >
                  Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
