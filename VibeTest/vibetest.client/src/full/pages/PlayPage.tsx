import { Link, useNavigate, useParams } from 'react-router-dom';
import { TestPlayer } from '@/components/tests/TestPlayer';
import { useAuth } from '@/full/context/AuthContext';
import { myTestsPath } from '@/utils/appPaths';

export function PlayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const testId = Number(id);

  if (isLoading) {
    return <p className="full-muted">Загрузка…</p>;
  }

  if (!Number.isFinite(testId)) {
    return <p className="full-error">Некорректный id теста</p>;
  }

  return (
    <section className="full-page">
      <p>
        <Link to={isAuthenticated ? myTestsPath('cloud') : '/tests'}>
          ← {isAuthenticated ? 'К моим тестам' : 'К публичным тестам'}
        </Link>
      </p>
      <TestPlayer
        source={{ type: 'api', testId, authenticated: isAuthenticated }}
        onExit={() => navigate(isAuthenticated ? myTestsPath('cloud') : '/tests')}
      />
    </section>
  );
}
