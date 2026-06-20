import type { ReactNode } from 'react';
import type { TestProgressStats } from '@/utils/playerHelpers';

interface TestListProgressMetaProps {
  stats: TestProgressStats;
  className?: string;
  suffix?: ReactNode;
}

export function TestListProgressMeta({ stats, className, suffix }: TestListProgressMetaProps) {
  return (
    <div className={className}>
      Всего: {stats.total} · Пройдено: {stats.answered} · Верно: {stats.correct} · Неверно:{' '}
      {stats.incorrect}
      {suffix}
    </div>
  );
}
