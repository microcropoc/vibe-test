import { LocalTestsList } from '@/components/tests/LocalTestsList';
import '@/guest/components/layout/GuestLayout.css';

export function LocalTestsPage() {
  return (
    <section className="guest-page">
      <h1>Мои тесты</h1>
      <p>Локальные тесты из браузера.</p>
      <LocalTestsList listClassName="guest-list" buttonClassPrefix="guest-button" />
    </section>
  );
}
