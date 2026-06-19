import { Link, useNavigate, useParams } from 'react-router-dom';
import { TestPlayer } from '@/components/tests/TestPlayer';
import { useAuth } from '@/full/context/AuthContext';

export function PlayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const testId = Number(id);

  if (isLoading) {
    return <p className="full-muted">Загрузка…</p>;
  }

  if (!isAuthenticated) {
    return (
      <section className="full-page">
        <p className="full-muted">Войдите, чтобы пройти тест с сохранением результата.</p>
        <Link to="/login">Вход</Link>
      </section>
    );
  }

  if (!Number.isFinite(testId)) {
    return <p className="full-error">Некорректный id теста</p>;
  }

  return (
    <section className="full-page">
      <p>
        <Link to={`/tests/${testId}`}>← К описанию</Link>
      </p>
      <TestPlayer
        source={{ type: 'api', testId }}
        onExit={() => navigate(`/tests/${testId}`)}
      />
    </section>
  );
}
