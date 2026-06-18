import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <section className="guest-page">
      <h1>Конструктор тестов</h1>
      <p>
        Гостевой режим работает полностью в браузере: создавайте тесты, импортируйте JSON,
        проходите их локально. Данные хранятся в localStorage и не отправляются на сервер.
      </p>
      <div className="guest-cards">
        <Link className="guest-card" to="/editor">
          <h2>Редактор</h2>
          <p>Создать новый тест и сохранить локально.</p>
        </Link>
        <Link className="guest-card" to="/import">
          <h2>Импорт</h2>
          <p>Загрузить тест из JSON-файла или буфера обмена.</p>
        </Link>
        <Link className="guest-card" to="/tests">
          <h2>Мои тесты</h2>
          <p>Список сохранённых тестов и прохождение.</p>
        </Link>
      </div>
    </section>
  );
}
