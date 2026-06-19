import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { testsApi } from '@/full/api';
import { getApiErrorMessage, useAuth } from '@/full/context/AuthContext';
import type { TestDetailResponse } from '@/types';

export function TestPage() {
  const { id } = useParams();
  const testId = Number(id);
  const { isAuthenticated } = useAuth();
  const [test, setTest] = useState<TestDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(testId)) {
      setError('Некорректный id теста');
      return;
    }

    let cancelled = false;
    void testsApi
      .getDetail(testId)
      .then((data) => {
        if (!cancelled) setTest(data);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, [testId]);

  if (error) {
    return <p className="full-error">{error}</p>;
  }

  if (!test) {
    return <p className="full-muted">Загрузка теста…</p>;
  }

  return (
    <section className="full-page">
      <p>
        <Link to="/tests">← К списку</Link>
      </p>
      <h1>{test.name}</h1>
      {test.description && <p className="full-muted">{test.description}</p>}
      <p className="full-muted">Автор: {test.authorName}</p>
      <p className="full-muted">Вопросов: {test.questions.length}</p>

      {isAuthenticated ? (
        <p>
          <Link to={`/tests/${testId}/play`} className="full-button">
            Пройти тест
          </Link>
        </p>
      ) : (
        <p className="full-muted">
          <Link to="/login">Войдите</Link>, чтобы пройти тест с сохранением результата.
        </p>
      )}
    </section>
  );
}
