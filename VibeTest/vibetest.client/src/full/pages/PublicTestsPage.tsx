import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { testsApi } from '@/full/api';
import { getApiErrorMessage } from '@/full/context/AuthContext';
import type { TestListItem } from '@/types';

export function PublicTestsPage() {
  const [items, setItems] = useState<TestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const page = await testsApi.getPublic(1, 20);
        if (!cancelled) {
          setItems(page.items);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="full-page">
      <h1>Публичные тесты</h1>
      <p className="full-muted">Список с сервера. Пагинация и прохождение — на Этапе 4.</p>

      {loading && <p className="full-muted">Загрузка…</p>}
      {error && <p className="full-error">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="full-muted">Публичных тестов пока нет.</p>
      )}

      <ul className="full-list">
        {items.map((test) => (
          <li key={test.id} className="full-list__item">
            <Link to={`/tests/${test.id}`} className="full-list__title">
              {test.name}
            </Link>
            <div className="full-list__meta">
              {test.authorName} · {test.questionsCount} вопр. ·{' '}
              {new Date(test.createdAt).toLocaleDateString()}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
