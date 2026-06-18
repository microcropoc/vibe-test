import { Link } from 'react-router-dom';
import { useAuth } from '@/full/context/AuthContext';

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="full-page">
      <h1>Конструктор тестов</h1>
      <p className="full-muted">
        Полный режим: публичные тесты с сервера, аккаунт, облачное сохранение и локальные функции гостя.
      </p>
      <div className="full-cards">
        <Link className="full-card" to="/tests">
          <h2>Публичные тесты</h2>
          <p className="full-muted">Каталог тестов с API.</p>
        </Link>
        <Link className="full-card" to="/editor">
          <h2>Редактор</h2>
          <p className="full-muted">Локальное создание (Этап 4).</p>
        </Link>
        {isAuthenticated ? (
          <Link className="full-card" to="/profile">
            <h2>Профиль</h2>
            <p className="full-muted">Статистика и история.</p>
          </Link>
        ) : (
          <Link className="full-card" to="/login">
            <h2>Войти</h2>
            <p className="full-muted">Сохранение тестов на сервере.</p>
          </Link>
        )}
      </div>
    </section>
  );
}
