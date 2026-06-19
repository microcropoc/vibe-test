import { Link, useNavigate, useParams } from 'react-router-dom';
import { TestPlayer } from '@/components/tests/TestPlayer';
import { getLocalTestById } from '@/utils/storage';

export function PlayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const testId = id ?? '';

  if (!testId || !getLocalTestById(testId)) {
    return (
      <section className="guest-page">
        <p className="guest-error">Тест не найден.</p>
        <Link to="/tests">← К списку</Link>
      </section>
    );
  }

  return (
    <section className="guest-page">
      <TestPlayer
        source={{ type: 'local', testId }}
        onExit={() => navigate('/tests')}
      />
    </section>
  );
}
