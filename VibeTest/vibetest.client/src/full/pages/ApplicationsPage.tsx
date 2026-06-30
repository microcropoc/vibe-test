import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Pagination } from '@/components/common/Pagination';
import { UserSearchDialog } from '@/full/components/UserSearchDialog';
import { applicationsApi, testsApi } from '@/full/api';
import { getApiErrorMessage } from '@/full/context/AuthContext';
import type {
  ApplicationListItem,
  ApplicationResponse,
  ApplicationType,
  IncomingApplicationListItem,
  TestListItem,
  UserSearchResult,
} from '@/types';
import { applicationPlayUrl, parseApplicationsTab, type ApplicationsTab } from '@/utils/appPaths';

const PAGE_SIZE = 10;

const TYPE_LABELS: Record<ApplicationType, string> = {
  link: 'по ссылке',
  internalUser: 'внутренняя',
};

async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export function ApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: ApplicationsTab = parseApplicationsTab(searchParams.toString());

  const [privateTests, setPrivateTests] = useState<TestListItem[]>([]);
  const [title, setTitle] = useState('');
  const [applicationType, setApplicationType] = useState<ApplicationType>('link');
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [testId, setTestId] = useState<number | ''>('');
  const [hideResultsFromParticipant, setHideResultsFromParticipant] = useState(false);
  const [created, setCreated] = useState<ApplicationResponse | null>(null);
  const [items, setItems] = useState<ApplicationListItem[]>([]);
  const [incomingItems, setIncomingItems] = useState<IncomingApplicationListItem[]>([]);
  const [page, setPage] = useState(1);
  const [incomingPage, setIncomingPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [incomingTotalPages, setIncomingTotalPages] = useState(1);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [incomingHasPreviousPage, setIncomingHasPreviousPage] = useState(false);
  const [incomingHasNextPage, setIncomingHasNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const loadMyList = useCallback(async (p: number) => {
    const data = await applicationsApi.getMy(p, PAGE_SIZE);
    setItems(data.items);
    setPage(data.page);
    setTotalPages(data.totalPages);
    setHasPreviousPage(data.hasPreviousPage);
    setHasNextPage(data.hasNextPage);
  }, []);

  const loadIncomingList = useCallback(async (p: number) => {
    const data = await applicationsApi.getIncoming(p, PAGE_SIZE);
    setIncomingItems(data.items);
    setIncomingPage(data.page);
    setIncomingTotalPages(data.totalPages);
    setIncomingHasPreviousPage(data.hasPreviousPage);
    setIncomingHasNextPage(data.hasNextPage);
  }, []);

  function switchTab(nextTab: ApplicationsTab) {
    if (nextTab === 'incoming') {
      setSearchParams({ tab: 'incoming' });
    } else {
      setSearchParams({});
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const testsData = await testsApi.getMy(1, 100, 'private');
        if (!cancelled) {
          setPrivateTests(testsData.items);
          setTestId((current) =>
            current === '' && testsData.items.length > 0 ? testsData.items[0].id : current,
          );
        }

        if (tab === 'incoming') {
          await loadIncomingList(incomingPage);
        } else {
          await loadMyList(page);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [tab, loadMyList, loadIncomingList, page, incomingPage]);

  function resetRecipient() {
    setSelectedUser(null);
  }

  function handleTypeChange(nextType: ApplicationType) {
    setApplicationType(nextType);
    if (nextType === 'link') {
      resetRecipient();
    }
  }

  function handleUserSelect(user: UserSearchResult) {
    setSelectedUser(user);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (testId === '') return;
    if (!title.trim()) return;
    if (applicationType === 'internalUser' && !selectedUser) return;

    setCreating(true);
    setError(null);
    setCreated(null);

    try {
      const app = await applicationsApi.create({
        title: title.trim(),
        type: applicationType,
        testId,
        hideResultsFromParticipant,
        recipientUserId:
          applicationType === 'internalUser' ? selectedUser?.id : undefined,
      });
      setCreated(app);
      setTitle('');
      resetRecipient();
      setApplicationType('link');
      setHideResultsFromParticipant(false);
      await loadMyList(1);
      setPage(1);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  async function handleCopy(token: string) {
    await copyToClipboard(applicationPlayUrl(token));
    setCopiedToken(token);
    window.setTimeout(() => setCopiedToken(null), 2000);
  }

  return (
    <section className="full-page">
      <h1>Заявки</h1>
      <p className="full-muted">
        Создайте ссылку для прохождения непубличного теста или предложите заявку пользователю
        системы.
      </p>
      {error && <p className="full-error">{error}</p>}

      <div className="full-tabs">
        <button
          type="button"
          className={`full-button${tab === 'my' ? '' : ' full-button--ghost'}`}
          onClick={() => switchTab('my')}
        >
          Мои заявки
        </button>
        <button
          type="button"
          className={`full-button${tab === 'incoming' ? '' : ' full-button--ghost'}`}
          onClick={() => switchTab('incoming')}
        >
          Мне предложено
        </button>
      </div>

      {tab === 'my' && (
        <>
          <h2 style={{ marginTop: '2rem' }}>Новая заявка</h2>
          <form
            onSubmit={(e) => void handleCreate(e)}
            className="full-form"
            style={{ maxWidth: '28rem' }}
          >
            <label className="full-form__label">
              Название заявки
              <input
                className="full-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Проверка знаний SQL"
              />
            </label>
            <fieldset className="full-form__label" style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend style={{ marginBottom: '0.5rem' }}>Тип заявки</legend>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <input
                  type="radio"
                  name="applicationType"
                  value="link"
                  checked={applicationType === 'link'}
                  onChange={() => handleTypeChange('link')}
                />
                По ссылке
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="radio"
                  name="applicationType"
                  value="internalUser"
                  checked={applicationType === 'internalUser'}
                  onChange={() => handleTypeChange('internalUser')}
                />
                Для внутреннего пользователя
              </label>
            </fieldset>
            {applicationType === 'internalUser' && (
              <div className="full-form__label">
                Получатель
                {selectedUser ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="full-chip">{selectedUser.displayName}</span>
                    <button
                      type="button"
                      className="full-button full-button--ghost"
                      onClick={resetRecipient}
                    >
                      Сбросить
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="full-button full-button--ghost"
                    onClick={() => setUserSearchOpen(true)}
                  >
                    Выбрать пользователя
                  </button>
                )}
              </div>
            )}
            <label className="full-form__label">
              Тест
              <select
                className="full-input"
                value={testId}
                onChange={(e) => setTestId(Number(e.target.value))}
                required
                disabled={privateTests.length === 0}
              >
                {privateTests.length === 0 ? (
                  <option value="">Нет непубличных тестов</option>
                ) : (
                  privateTests.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label
              className="full-form__label"
              style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}
            >
              <input
                type="checkbox"
                checked={hideResultsFromParticipant}
                onChange={(e) => setHideResultsFromParticipant(e.target.checked)}
              />
              Скрыть результат от участника
            </label>
            <button
              type="submit"
              className="full-button"
              disabled={
                creating ||
                privateTests.length === 0 ||
                (applicationType === 'internalUser' && !selectedUser)
              }
            >
              {creating ? 'Создание…' : 'Создать'}
            </button>
          </form>

          {created && (
            <div className="full-list__item" style={{ marginTop: '1rem' }}>
              {created.type === 'link' ? (
                <>
                  <p>
                    Ссылка для <strong>{created.title}</strong> ({created.testName}):
                  </p>
                  <code style={{ wordBreak: 'break-all' }}>
                    {applicationPlayUrl(created.token)}
                  </code>
                  <div style={{ marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      className="full-button full-button--ghost"
                      onClick={() => void handleCopy(created.token)}
                    >
                      {copiedToken === created.token ? 'Скопировано' : 'Копировать'}
                    </button>
                  </div>
                </>
              ) : (
                <p>
                  Заявка <strong>{created.title}</strong> ({created.testName}) отправлена
                  пользователю.
                </p>
              )}
            </div>
          )}

          <h2 style={{ marginTop: '2rem' }}>Мои заявки</h2>
          {items.length === 0 ? (
            <p className="full-muted">Заявок пока нет.</p>
          ) : (
            <ul className="full-list">
              {items.map((item) => (
                <li key={item.id} className="full-list__item">
                  <div className="full-list__title">
                    {item.title} — {item.testName}
                    <span className="full-muted" style={{ fontWeight: 400 }}>
                      {' '}
                      · {TYPE_LABELS[item.type]}
                    </span>
                  </div>
                  <div className="full-list__meta">
                    {new Date(item.createdAt).toLocaleString()} ·{' '}
                    {item.hideResultsFromParticipant && <>без результата · </>}
                    {item.isCompleted ? (
                      <>
                        пройден · {item.correctAnswers}/{item.totalQuestions} ·{' '}
                        {item.scorePercent.toFixed(0)}%
                      </>
                    ) : (
                      'не пройден'
                    )}
                  </div>
                  {item.type === 'link' && (
                    <button
                      type="button"
                      className="full-button full-button--ghost"
                      style={{ marginTop: '0.5rem' }}
                      onClick={() => void handleCopy(item.token)}
                    >
                      {copiedToken === item.token ? 'Скопировано' : 'Копировать ссылку'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            onPageChange={setPage}
          />
        </>
      )}

      {tab === 'incoming' && (
        <>
          <h2 style={{ marginTop: '2rem' }}>Мне предложено</h2>
          {incomingItems.length === 0 ? (
            <p className="full-muted">Предложений пока нет.</p>
          ) : (
            <ul className="full-list">
              {incomingItems.map((item) => (
                <li key={item.id} className="full-list__item">
                  <div className="full-list__title">
                    {item.title} — {item.testName}
                  </div>
                  <div className="full-list__meta">
                    от {item.authorName} · {new Date(item.createdAt).toLocaleString()} ·{' '}
                    {item.hideResultsFromParticipant && <>без результата · </>}
                    {item.isCompleted ? 'пройден' : 'не пройден'}
                  </div>
                  <Link
                    to={`/application/${item.token}`}
                    className="full-button"
                    style={{ marginTop: '0.5rem' }}
                  >
                    Пройти
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Pagination
            page={incomingPage}
            totalPages={incomingTotalPages}
            hasPreviousPage={incomingHasPreviousPage}
            hasNextPage={incomingHasNextPage}
            onPageChange={setIncomingPage}
          />
        </>
      )}

      <UserSearchDialog
        open={userSearchOpen}
        onClose={() => setUserSearchOpen(false)}
        onSelect={handleUserSelect}
      />
    </section>
  );
}
