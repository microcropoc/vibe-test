import { Link, useNavigate, useParams } from 'react-router-dom';
import { TestPlayer } from '@/components/tests/TestPlayer';
import { localTestsListPath } from '@/utils/appPaths';
import { errorClassName, pageClassName } from '@/utils/pageShell';
import { getLocalTestById } from '@/utils/storage';

export function PlayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const testId = id ?? '';
  const listPath = localTestsListPath();
  const localTest = testId ? getLocalTestById(testId) : undefined;

  if (!testId || !localTest) {
    return (
      <section className={pageClassName()}>
        <p className={errorClassName()}>Тест не найден.</p>
        <Link to={listPath}>← К списку</Link>
      </section>
    );
  }

  return (
    <section className={pageClassName()}>
      <TestPlayer
        source={{ type: 'local', testId }}
        onExit={() => navigate(listPath)}
      />
    </section>
  );
}
