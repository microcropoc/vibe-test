import { useCallback, useEffect, useState } from 'react';
import { Pagination } from '@/components/common/Pagination';
import { applicationsApi, testsApi } from '@/full/api';
import { getApiErrorMessage } from '@/full/context/AuthContext';
import type { ApplicationListItem, ApplicationResponse, TestListItem } from '@/types';
import { applicationPlayUrl } from '@/utils/appPaths';

const PAGE_SIZE = 10;

async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export function ApplicationsPage() {
  const [privateTests, setPrivateTests] = useState<TestListItem[]>([]);
  const [participantName, setParticipantName] = useState('');
  const [testId, setTestId] = useState<number | ''>('');
  const [hideResultsFromParticipant, setHideResultsFromParticipant] = useState(false);
  const [created, setCreated] = useState<ApplicationResponse | null>(null);
  const [items, setItems] = useState<ApplicationListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const loadList = useCallback(async (p: number) => {
    const data = await applicationsApi.getMy(p, PAGE_SIZE);
    setItems(data.items);
    setPage(data.page);
    setTotalPages(data.totalPages);
    setHasPreviousPage(data.hasPreviousPage);
    setHasNextPage(data.hasNextPage);
  }, []);

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
        await loadList(page);
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
  }, [loadList, page]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!participantName.trim() || testId === '') return;

    setCreating(true);
    setError(null);
    setCreated(null);

    try {
      const app = await applicationsApi.create({
        participantName: participantName.trim(),
        testId,
        hideResultsFromParticipant,
      });
      setCreated(app);
      setParticipantName('');
      setHideResultsFromParticipant(false);
      await loadList(1);
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
        Создайте ссылку для прохождения непубличного теста без входа в систему.
      </p>
      {error && <p className="full-error">{error}</p>}

      <h2 style={{ marginTop: '2rem' }}>Новая заявка</h2>
      <form onSubmit={(e) => void handleCreate(e)} className="full-form" style={{ maxWidth: '28rem' }}>
        <label className="full-form__label">
          Имя участника
          <input
            className="full-input"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            required
            placeholder="Иван"
          />
        </label>
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
        <label className="full-form__label" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
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
          disabled={creating || privateTests.length === 0}
        >
          {creating ? 'Создание…' : 'Создать'}
        </button>
      </form>

      {created && (
        <div className="full-list__item" style={{ marginTop: '1rem' }}>
          <p>
            Ссылка для <strong>{created.participantName}</strong> ({created.testName}):
          </p>
          <code style={{ wordBreak: 'break-all' }}>{applicationPlayUrl(created.token)}</code>
          <div style={{ marginTop: '0.5rem' }}>
            <button
              type="button"
              className="full-button full-button--ghost"
              onClick={() => void handleCopy(created.token)}
            >
              {copiedToken === created.token ? 'Скопировано' : 'Копировать'}
            </button>
          </div>
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
                {item.participantName} — {item.testName}
              </div>
              <div className="full-list__meta">
                {new Date(item.createdAt).toLocaleString()} ·{' '}
                {item.hideResultsFromParticipant && (
                  <>
                    без результата ·{' '}
                  </>
                )}
                {item.isCompleted ? (
                  <>
                    пройден · {item.correctAnswers}/{item.totalQuestions} ·{' '}
                    {item.scorePercent.toFixed(0)}%
                  </>
                ) : (
                  'не пройден'
                )}
              </div>
              <button
                type="button"
                className="full-button full-button--ghost"
                style={{ marginTop: '0.5rem' }}
                onClick={() => void handleCopy(item.token)}
              >
                {copiedToken === item.token ? 'Скопировано' : 'Копировать ссылку'}
              </button>
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
    </section>
  );
}
