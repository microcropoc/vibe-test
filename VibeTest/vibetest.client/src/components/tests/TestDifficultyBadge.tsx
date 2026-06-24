import type { TestDifficulty } from '@/types';
import { normalizeDifficulty, TEST_DIFFICULTY_LABELS } from '@/utils/testDifficulty';

type TestDifficultyBadgeProps = {
  difficulty?: TestDifficulty | null;
  className?: string;
};

export function TestDifficultyBadge({ difficulty, className }: TestDifficultyBadgeProps) {
  const value = normalizeDifficulty(difficulty);

  return (
    <span className={`vt-badge vt-badge--difficulty-${value}${className ? ` ${className}` : ''}`}>
      {TEST_DIFFICULTY_LABELS[value]}
    </span>
  );
}
