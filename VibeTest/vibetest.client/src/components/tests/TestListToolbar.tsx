import { PAGE_SIZES, type PageSize } from '@/utils/pagination';
import type { SortOrder, TestSortBy } from '@/utils/sortTests';
import '@/components/tests/tests.css';

export type TestSortOption = `${TestSortBy}:${SortOrder}`;

const SORT_OPTIONS: { value: TestSortOption; label: string }[] = [
  { value: 'name:asc', label: 'По имени (А→Я)' },
  { value: 'name:desc', label: 'По имени (Я→А)' },
  { value: 'updatedAt:desc', label: 'Сначала недавно обновлённые' },
  { value: 'updatedAt:asc', label: 'Сначала давно обновлённые' },
];

export function toSortOption(sortBy: TestSortBy, order: SortOrder): TestSortOption {
  return `${sortBy}:${order}`;
}

export function parseSortOption(option: TestSortOption): { sortBy: TestSortBy; order: SortOrder } {
  const [sortBy, order] = option.split(':') as [TestSortBy, SortOrder];
  return { sortBy, order };
}

interface TestListToolbarProps {
  totalCount: number;
  pageSize: PageSize;
  onPageSizeChange: (size: PageSize) => void;
  sortBy: TestSortBy;
  order: SortOrder;
  onSortChange: (sortBy: TestSortBy, order: SortOrder) => void;
  pageSizeSelectId?: string;
  sortSelectId?: string;
}

export function TestListToolbar({
  totalCount,
  pageSize,
  onPageSizeChange,
  sortBy,
  order,
  onSortChange,
  pageSizeSelectId = 'test-list-page-size',
  sortSelectId = 'test-list-sort',
}: TestListToolbarProps) {
  const sortOption = toSortOption(sortBy, order);

  return (
    <div className="test-list-toolbar">
      <span className="vt-muted">Всего: {totalCount}</span>
      <div className="test-list-toolbar__controls">
        <label className="test-list-toolbar__page-size" htmlFor={pageSizeSelectId}>
          На странице
          <select
            id={pageSizeSelectId}
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value) as PageSize)}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <label className="test-list-toolbar__sort" htmlFor={sortSelectId}>
          Сортировка
          <select
            id={sortSelectId}
            value={sortOption}
            onChange={(e) => {
              const { sortBy: nextSortBy, order: nextOrder } = parseSortOption(
                e.target.value as TestSortOption,
              );
              onSortChange(nextSortBy, nextOrder);
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
