import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pagination } from '@/components/common/Pagination';
import { TestListProgressMeta } from '@/components/tests/TestListProgressMeta';
import { TestDifficultyBadge } from '@/components/tests/TestDifficultyBadge';
import { TestListToolbar } from '@/components/tests/TestListToolbar';
import { testsApi } from '@/full/api';
import { getApiErrorMessage } from '@/full/context/AuthContext';
import type { TestListItem } from '@/types';
import { type PageSize } from '@/utils/pagination';
import { getTestProgressStats } from '@/utils/playerHelpers';
import type { SortOrder, TestSortBy } from '@/utils/sortTests';
import { getApiTestProgress } from '@/utils/storage';
import '@/components/tests/tests.css';

export function PublicTestsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [sortBy, setSortBy] = useState<TestSortBy>('updatedAt');
  const [order, setOrder] = useState<SortOrder>('desc');
  const [items, setItems] = useState<TestListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(
    async (p: number, size: PageSize, nextSortBy: TestSortBy, nextOrder: SortOrder) => {
      setLoading(true);
      setError(null);
      try {
        const response = await testsApi.getPublic(p, size, nextSortBy, nextOrder);
        setItems(response.items);
        setPage(response.page);
        setTotalCount(response.totalCount);
        setTotalPages(response.totalPages);
        setHasPreviousPage(response.hasPreviousPage);
        setHasNextPage(response.hasNextPage);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadPage(page, pageSize, sortBy, order);
  }, [loadPage, page, pageSize, sortBy, order]);

  function handlePageSizeChange(size: PageSize) {
    setPageSize(size);
    setPage(1);
  }

  function handleSortChange(nextSortBy: TestSortBy, nextOrder: SortOrder) {
    setSortBy(nextSortBy);
    setOrder(nextOrder);
    setPage(1);
  }

  return (
    <section className="full-page">
      <h1>Публичные тесты</h1>

      {loading && <p className="full-muted">Загрузка…</p>}
      {error && <p className="full-error">{error}</p>}

      {!loading && !error && totalCount === 0 && (
        <p className="full-muted">Публичных тестов пока нет.</p>
      )}

      {!loading && !error && totalCount > 0 && (
        <TestListToolbar
          totalCount={totalCount}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          sortBy={sortBy}
          order={order}
          onSortChange={handleSortChange}
        />
      )}

      <ul className="full-list">
        {items.map((test) => {
          const stats = getTestProgressStats(test.questionsCount, getApiTestProgress(test.id));

          return (
            <li key={test.id} className="full-list__item">
              <div className="full-list__title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Link to={`/tests/${test.id}`}>{test.name}</Link>
                <TestDifficultyBadge difficulty={test.difficulty} />
              </div>
              <TestListProgressMeta
                className="full-list__meta"
                stats={stats}
                suffix={
                  <>
                    {' '}
                    · {test.authorName} · обновлён{' '}
                    {new Date(test.updatedAt).toLocaleDateString()}
                  </>
                }
              />
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
