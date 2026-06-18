import { useEffect, useState } from 'react';
import { testsApi } from '@/full/api';
import { getApiErrorMessage } from '@/full/context/AuthContext';
import type { TestListItem } from '@/types';

export function MyTestsPage() {
  const [items, setItems] = useState<TestListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void testsApi
      .getMy(1, 20, 'all')
      .then((page) => {
        if (!cancelled) setItems(page.items);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="full-page">
      <h1>Мои тесты</h1>
      <p className="full-muted">Облачные тесты. Редактор и публикация — Этап 4.</p>
      {error && <p className="full-error">{error}</p>}
      <ul className="full-list">
        {items.map((test) => (
          <li key={test.id} className="full-list__item">
            <div className="full-list__title">{test.name}</div>
            <div className="full-list__meta">
              {test.questionsCount} вопр. · {new Date(test.createdAt).toLocaleDateString()}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
