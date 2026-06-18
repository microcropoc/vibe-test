import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/full/context/AuthContext';
import './FullLayout.css';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'full-nav__link full-nav__link--active' : 'full-nav__link';

export function FullLayout() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="full-shell">
      <header className="full-header">
        <div className="full-header__brand">
          <Link to="/" className="full-header__logo">
            VibeTest
          </Link>
          <span className="full-header__badge">Full</span>
        </div>
        <nav className="full-nav" aria-label="Основная навигация">
          <NavLink to="/tests" className={navLinkClass}>
            Публичные тесты
          </NavLink>
          <NavLink to="/editor" className={navLinkClass}>
            Редактор
          </NavLink>
          <NavLink to="/import" className={navLinkClass}>
            Импорт
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/my/tests" className={navLinkClass}>
                Мои тесты
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                Профиль
              </NavLink>
            </>
          )}
          {isAuthenticated ? (
            <>
              <span className="full-nav__user">{user?.displayName}</span>
              <button type="button" className="full-button full-button--ghost" onClick={logout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Вход
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                Регистрация
              </NavLink>
            </>
          )}
        </nav>
      </header>
      <main className="full-main">
        <Outlet />
      </main>
      <footer className="full-footer">Режим full — данные с API и localStorage.</footer>
    </div>
  );
}
