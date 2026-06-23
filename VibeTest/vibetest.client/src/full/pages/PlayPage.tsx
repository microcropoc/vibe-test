import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { TestPlayer } from '@/components/tests/TestPlayer';
import { useAuth } from '@/full/context/AuthContext';
import { myTestsPath } from '@/utils/appPaths';

export function PlayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const testId = Number(id);

  if (isLoading) {
    return <p className="full-muted">Загрузка…</p>;
  }

  if (!isAuthenticated) {
    return (
      <section className="full-page">
        <p className="full-muted">Войдите, чтобы пройти тест с сохранением результата.</p>
        <Link to="/login" state={{ from: location.pathname }}>
          Вход
        </Link>
      </section>
    );
  }

  if (!Number.isFinite(testId)) {
    return <p className="full-error">Некорректный id теста</p>;
  }

  return (
    <section className="full-page">
      <p>
        <Link to={myTestsPath('cloud')}>← К моим тестам</Link>
      </p>
      <TestPlayer
        source={{ type: 'api', testId }}
        onExit={() => navigate(myTestsPath('cloud'))}
      />
    </section>
  );
}
