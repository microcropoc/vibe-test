import { Link, NavLink, Outlet } from 'react-router-dom';
import { basePath } from '@/config/env';
import './GuestLayout.css';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'guest-nav__link guest-nav__link--active' : 'guest-nav__link';

export function GuestLayout() {
  return (
    <div className="guest-shell">
      <header className="guest-header">
        <div className="guest-header__brand">
          <Link to="/" className="guest-header__logo">
            VibeTest
          </Link>
          <span className="guest-header__badge">Guest</span>
        </div>
        <nav className="guest-nav" aria-label="Гостевой режим">
          <NavLink to="/tests" className={navLinkClass}>
            Мои тесты
          </NavLink>
          <NavLink to="/editor" className={navLinkClass}>
            Редактор
          </NavLink>
          <NavLink to="/import" className={navLinkClass}>
            Импорт
          </NavLink>
          <NavLink to="/info" className={navLinkClass}>
            Инфо
          </NavLink>
        </nav>
      </header>
      <main className="guest-main">
        <Outlet />
      </main>
      <footer className="guest-footer">
        Автономный режим — данные только в браузере. Base: <code>{basePath}</code>
      </footer>
    </div>
  );
}
