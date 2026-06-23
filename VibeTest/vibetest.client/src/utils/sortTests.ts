import type { LocalTest } from '@/types';

export type TestSortBy = 'name' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export function sortLocalTests(
  tests: LocalTest[],
  sortBy: TestSortBy,
  order: SortOrder,
): LocalTest[] {
  const sorted = [...tests];
  const direction = order === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    if (sortBy === 'name') {
      return direction * a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    }

    const aTime = new Date(a.updatedAt).getTime();
    const bTime = new Date(b.updatedAt).getTime();
    return direction * (aTime - bTime);
  });

  return sorted;
}
