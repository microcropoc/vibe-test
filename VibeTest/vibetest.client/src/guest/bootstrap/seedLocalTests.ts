import { SEED_TESTS } from '@/guest/data/seedTests';
import { createLocalTestFromDefinition, getIsInitLocalTests, setIsInitLocalTests, getLocalTests, saveLocalTestsBulk } from '@/utils/storage';

export function seedGuestTestsIfEmpty(): void {
  if (getLocalTests().length > 0 || getIsInitLocalTests()) {
    return;
  }

  const tests = SEED_TESTS.map(createLocalTestFromDefinition);
  saveLocalTestsBulk(tests);
  setIsInitLocalTests();
}
