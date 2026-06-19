import { SEED_TESTS } from '@/guest/data/seedTests';
import { createLocalTestFromDefinition, getLocalTests, saveLocalTestsBulk } from '@/utils/storage';

export function seedGuestTestsIfEmpty(): void {
  if (getLocalTests().length > 0) {
    return;
  }

  const tests = SEED_TESTS.map(createLocalTestFromDefinition);
  saveLocalTestsBulk(tests);
}
