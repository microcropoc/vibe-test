import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { TestEditor } from '@/components/tests/TestEditor';
import { isFullMode } from '@/config/env';
import { useAuth } from '@/full/context/AuthContext';
import {
  editorPath,
  isApiTestId,
  localTestsListPath,
  myTestsPath,
} from '@/utils/appPaths';
import { pageClassName, mutedClassName } from '@/utils/pageShell';

export function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const wantsCloud = isFullMode && searchParams.get('storage') === 'cloud';
  const useApiMode = isFullMode && (wantsCloud || (id !== undefined && isApiTestId(id)));
  const apiTestId = useApiMode && id ? Number(id) : undefined;
  const localTestId = !useApiMode && id ? id : undefined;
  const listPath = useApiMode ? myTestsPath('cloud') : localTestsListPath();

  const needsAuth = useApiMode && !isAuthenticated;

  return (
    <section className={pageClassName()}>
      <h1>{id ? 'Редактирование теста' : 'Новый тест'}</h1>
      <p className={mutedClassName()}>
        {isFullMode
          ? useApiMode
            ? 'Создание и дополнение тестов на сервере.'
            : 'Создание теста с сохранением в браузере и экспортом JSON.'
          : 'Создание теста с сохранением в браузере и экспортом JSON.'}
      </p>

      {isFullMode && !id && (
        <p className={mutedClassName()}>
          {useApiMode ? (
            <>
              <Link to={editorPath()}>Локальный тест</Link>
              {' · '}
              облачный режим
            </>
          ) : (
            <>
              локальный режим ·{' '}
              <Link to={editorPath({ cloud: true })}>Создать облачный тест</Link>
            </>
          )}
        </p>
      )}

      {needsAuth ? (
        <p className={mutedClassName()}>
          Войдите, чтобы работать с облачными тестами.{' '}
          <Link to="/login" state={{ from: location.pathname + location.search }}>
            Вход
          </Link>
        </p>
      ) : (
        <TestEditor
          mode={useApiMode ? 'api' : 'local'}
          localTestId={localTestId}
          apiTestId={apiTestId}
          onSaved={() => {
            navigate(listPath);
          }}
        />
      )}

      <p style={{ marginTop: '1rem' }}>
        <Link to={listPath}>← К списку</Link>
      </p>
    </section>
  );
}
