import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pagination } from '@/components/common/Pagination';
import { testsApi } from '@/full/api';
import { getApiErrorMessage } from '@/full/context/AuthContext';
import type { TestListItem } from '@/types';

const PAGE_SIZE = 10;

export function PublicTestsPage() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<TestListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await testsApi.getPublic(p, PAGE_SIZE);
      setItems(response.items);
      setPage(response.page);
      setTotalPages(response.totalPages);
      setHasPreviousPage(response.hasPreviousPage);
      setHasNextPage(response.hasNextPage);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(page);
  }, [loadPage, page]);

  return (
    <section className="full-page">
      <h1>Публичные тесты</h1>

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

      <Pagination
        page={page}
        totalPages={totalPages}
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        onPageChange={setPage}
      />
    </section>
  );
}
