import { Link, useNavigate, useParams } from 'react-router-dom';
import { TestEditor } from '@/components/tests/TestEditor';
import { isFullMode } from '@/config/env';

export function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <section className={isFullMode ? 'full-page' : 'guest-page'}>
      <h1>{id ? 'Редактирование теста' : 'Новый тест'}</h1>
      <p className={isFullMode ? 'full-muted' : undefined}>
        {isFullMode
          ? 'Создание и дополнение тестов на сервере.'
          : 'Создание теста с сохранением в браузере и экспортом JSON.'}
      </p>
      <TestEditor
        mode={isFullMode ? 'api' : 'local'}
        localTestId={!isFullMode ? id : undefined}
        apiTestId={isFullMode && id ? Number(id) : undefined}
        onSaved={() => {
          navigate(isFullMode ? '/my/tests' : '/tests');
        }}
      />
      <p style={{ marginTop: '1rem' }}>
        <Link to={isFullMode ? '/my/tests' : '/tests'}>← К списку</Link>
      </p>
    </section>
  );
}
