import { Link, useParams } from 'react-router-dom';
import { TestPlayer } from '@/components/tests/TestPlayer';

const GUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function ApplicationPlayPage() {
  const { token } = useParams();

  if (!token || !GUID_RE.test(token)) {
    return <p className="full-error">Некорректная ссылка заявки</p>;
  }

  return (
    <section className="full-page">
      <p>
        <Link to="/">← На главную</Link>
      </p>
      <TestPlayer source={{ type: 'application', token }} />
    </section>
  );
}
