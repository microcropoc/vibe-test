import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { Pagination } from '@/components/common/Pagination';
import { TestListProgressMeta } from '@/components/tests/TestListProgressMeta';
import { TestListToolbar } from '@/components/tests/TestListToolbar';
import { isFullMode } from '@/config/env';
import type { LocalTest } from '@/types';
import { clampPage, getPageSlice, type PageSize } from '@/utils/pagination';
import { getTestProgressStats } from '@/utils/playerHelpers';
import { sortLocalTests, type SortOrder, type TestSortBy } from '@/utils/sortTests';
import { deleteLocalTest, getLocalTestsSnapshot, getTestProgress } from '@/utils/storage';
import '@/guest/components/layout/GuestLayout.css';
import '@/components/tests/tests.css';

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [sortBy, setSortBy] = useState<TestSortBy>('updatedAt');
  const [order, setOrder] = useState<SortOrder>('desc');

  const sorted = useMemo(() => sortLocalTests(tests, sortBy, order), [tests, sortBy, order]);
  const slice = useMemo(() => getPageSlice(sorted, page, pageSize), [sorted, page, pageSize]);

  useEffect(() => {
    setPage((current) => clampPage(current, sorted.length, pageSize));
  }, [sorted.length, pageSize]);

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
    <section className={isFullMode ? 'full-page' : 'guest-page'}>
      <h1>Мои тесты</h1>
      <p>Локальные тесты из браузера.</p>

      {tests.length === 0 ? (
        <div className="guest-empty">
          Пока нет сохранённых тестов.{' '}
          <Link to="/editor">Создайте первый</Link> или <Link to="/import">импортируйте JSON</Link>.
        </div>
      ) : (
        <>
          <TestListToolbar
            totalCount={sorted.length}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            sortBy={sortBy}
            order={order}
            onSortChange={handleSortChange}
          />

          <ul className="guest-list">
            {slice.items.map((test) => {
              const stats = getTestProgressStats(test.questions.length, getTestProgress(test.id));

              return (
                <li key={test.id} className="guest-list__item">
                  <div>
                    <div className="guest-list__title">{test.name}</div>
                    <TestListProgressMeta
                      className="guest-list__meta"
                      stats={stats}
                      suffix={<> · обновлён {new Date(test.updatedAt).toLocaleString()}</>}
                    />
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
              );
            })}
          </ul>

          <Pagination
            page={slice.page}
            totalPages={slice.totalPages}
            hasPreviousPage={slice.hasPreviousPage}
            hasNextPage={slice.hasNextPage}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}
