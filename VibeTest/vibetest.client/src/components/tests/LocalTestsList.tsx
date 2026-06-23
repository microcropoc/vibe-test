import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { Pagination } from '@/components/common/Pagination';
import { TestListProgressMeta } from '@/components/tests/TestListProgressMeta';
import { TestListToolbar } from '@/components/tests/TestListToolbar';
import type { LocalTest } from '@/types';
import { clampPage, getPageSlice, type PageSize } from '@/utils/pagination';
import { getTestProgressStats } from '@/utils/playerHelpers';
import { sortLocalTests, type SortOrder, type TestSortBy } from '@/utils/sortTests';
import { deleteLocalTest, getLocalTestsSnapshot, getTestProgress } from '@/utils/storage';
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

type LocalTestsListProps = {
  listClassName: 'guest-list' | 'full-list';
  buttonClassPrefix: 'guest-button' | 'full-button';
  emptyClassName?: string;
  playTo?: (testId: string) => string;
};

export function LocalTestsList({
  listClassName,
  buttonClassPrefix,
  emptyClassName = listClassName === 'guest-list' ? 'guest-empty' : 'full-muted',
  playTo = (testId) => `/play/${testId}`,
}: LocalTestsListProps) {
  const listPrefix = listClassName;
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

  const ghostButton = `${buttonClassPrefix} ${buttonClassPrefix}--ghost`;
  const dangerButton = `${buttonClassPrefix} ${buttonClassPrefix}--danger`;

  if (tests.length === 0) {
    return (
      <div className={emptyClassName}>
        Пока нет сохранённых тестов.{' '}
        <Link to="/editor">Создайте первый</Link> или <Link to="/import">импортируйте JSON</Link>.
      </div>
    );
  }

  return (
    <>
      <TestListToolbar
        totalCount={sorted.length}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        sortBy={sortBy}
        order={order}
        onSortChange={handleSortChange}
      />

      <ul className={listClassName}>
        {slice.items.map((test) => {
          const stats = getTestProgressStats(test.questions.length, getTestProgress(test.id));

          return (
            <li key={test.id} className={`${listPrefix}__item`}>
              <div>
                <div className={`${listPrefix}__title`}>{test.name}</div>
                <TestListProgressMeta
                  className={`${listPrefix}__meta`}
                  stats={stats}
                  suffix={<> · обновлён {new Date(test.updatedAt).toLocaleString()}</>}
                />
              </div>
              <div
                className={listClassName === 'guest-list' ? 'guest-list__actions' : undefined}
                style={
                  listClassName === 'full-list'
                    ? { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }
                    : undefined
                }
              >
                <Link to={playTo(test.id)} className={buttonClassPrefix}>
                  Пройти
                </Link>
                <Link to={`/editor/${test.id}`} className={ghostButton}>
                  Редактировать
                </Link>
                <button
                  type="button"
                  className={dangerButton}
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
  );
}
