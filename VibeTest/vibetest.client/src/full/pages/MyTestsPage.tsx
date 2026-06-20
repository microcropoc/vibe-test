import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pagination } from '@/components/common/Pagination';
import { TestListProgressMeta } from '@/components/tests/TestListProgressMeta';
import { testsApi } from '@/full/api';
import { getApiErrorMessage } from '@/full/context/AuthContext';
import type { TestListItem } from '@/types';
import { getTestProgressStats } from '@/utils/playerHelpers';
import { getApiTestProgress } from '@/utils/storage';

const PAGE_SIZE = 10;

type Filter = 'all' | 'published' | 'private';

export function MyTestsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>('all');
  const [items, setItems] = useState<TestListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  const loadPage = useCallback(async (p: number, f: Filter) => {
    setLoading(true);
    setError(null);
    try {
      const response = await testsApi.getMy(p, PAGE_SIZE, f);
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
    void loadPage(page, filter);
  }, [loadPage, page, filter]);

  async function runAction(id: number, action: () => Promise<unknown>) {
    setActionId(id);
    setError(null);
    try {
      await action();
      await loadPage(page, filter);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionId(null);
    }
  }

  return (
    <section className="full-page">
      <h1>Мои тесты</h1>
      <p>
        <Link to="/editor" className="full-button">
          Создать тест
        </Link>
      </p>

      <div className="full-filters" style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
        {(['all', 'published', 'private'] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`full-button ${filter === f ? '' : 'full-button--ghost'}`}
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
          >
            {f === 'all' ? 'Все' : f === 'published' ? 'Опубликованные' : 'Черновики'}
          </button>
        ))}
      </div>

      {loading && <p className="full-muted">Загрузка…</p>}
      {error && <p className="full-error">{error}</p>}

      <ul className="full-list">
        {items.map((test) => {
          const stats = getTestProgressStats(test.questionsCount, getApiTestProgress(test.id));

          return (
          <li key={test.id} className="full-list__item">
            <div className="full-list__title">{test.name}</div>
            <TestListProgressMeta
              className="full-list__meta"
              stats={stats}
              suffix={<> · {new Date(test.createdAt).toLocaleDateString()}</>}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Link to={`/editor/${test.id}`} className="full-button full-button--ghost">
                Редактировать
              </Link>
              <button
                type="button"
                className="full-button full-button--ghost"
                disabled={actionId === test.id}
                onClick={() => runAction(test.id, () => testsApi.publish(test.id))}
              >
                Опубликовать
              </button>
              <button
                type="button"
                className="full-button full-button--ghost"
                disabled={actionId === test.id}
                onClick={() => runAction(test.id, () => testsApi.unpublish(test.id))}
              >
                Скрыть
              </button>
              <button
                type="button"
                className="full-button full-button--ghost"
                disabled={actionId === test.id}
                onClick={() => runAction(test.id, () => testsApi.fork(test.id))}
              >
                Копия
              </button>
              <button
                type="button"
                className="full-button full-button--danger"
                disabled={actionId === test.id}
                onClick={() => {
                  if (window.confirm(`Удалить тест «${test.name}»?`)) {
                    void runAction(test.id, () => testsApi.delete(test.id));
                  }
                }}
              >
                Удалить
              </button>
            </div>
          </li>
          );
        })}
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
