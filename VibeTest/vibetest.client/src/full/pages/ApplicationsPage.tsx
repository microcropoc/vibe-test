import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { applicationsApi, testsApi } from '@/full/api';
import { ApplicationCreateForm } from '@/full/components/ApplicationCreateForm';
import { IncomingApplicationsSection, MyApplicationsSection } from '@/full/components/ApplicationsLists';
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

async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export function ApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: ApplicationsTab = parseApplicationsTab(searchParams.toString());
  const myListRequestId = useRef(0);
  const incomingListRequestId = useRef(0);
  const privateTestsRequestId = useRef(0);

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
  const [listError, setListError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingTests, setIsLoadingTests] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const loadMyList = useCallback(async (p: number) => {
    const requestId = ++myListRequestId.current;
    const data = await applicationsApi.getMy(p, PAGE_SIZE);
    if (requestId !== myListRequestId.current) return;
    setItems(data.items);
    setPage(data.page);
    setTotalPages(data.totalPages);
    setHasPreviousPage(data.hasPreviousPage);
    setHasNextPage(data.hasNextPage);
  }, []);

  const loadIncomingList = useCallback(async (p: number) => {
    const requestId = ++incomingListRequestId.current;
    const data = await applicationsApi.getIncoming(p, PAGE_SIZE);
    if (requestId !== incomingListRequestId.current) return;
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
    const requestId = ++privateTestsRequestId.current;

    async function loadPrivateTests() {
      setIsLoadingTests(true);
      try {
        const testsData = await testsApi.getMy(1, 100, 'private');
        if (requestId !== privateTestsRequestId.current) return;

        setPrivateTests(testsData.items);
        setTestId((current) =>
          current === '' && testsData.items.length > 0 ? testsData.items[0].id : current,
        );
      } catch (err) {
        if (requestId === privateTestsRequestId.current) {
          setListError(getApiErrorMessage(err));
        }
      } finally {
        if (requestId === privateTestsRequestId.current) {
          setIsLoadingTests(false);
        }
      }
    }

    void loadPrivateTests();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadList() {
      setIsLoadingList(true);
      setListError(null);
      try {
        if (tab === 'incoming') {
          await loadIncomingList(incomingPage);
        } else {
          await loadMyList(page);
        }
      } catch (err) {
        if (!cancelled) {
          setListError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingList(false);
        }
      }
    }

    void loadList();
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

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (testId === '') return;
    if (!title.trim()) return;
    if (applicationType === 'internalUser' && !selectedUser) return;

    setCreating(true);
    setCreateError(null);
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
      setCreateError(getApiErrorMessage(err));
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
    <section className="full-page" aria-busy={isLoadingTests || isLoadingList}>
      <h1>Заявки</h1>
      <p className="full-muted">
        Создайте ссылку для прохождения непубличного теста или предложите заявку пользователю
        системы.
      </p>
      {(createError || listError) && <p className="full-error">{createError ?? listError}</p>}

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
          <ApplicationCreateForm
            title={title}
            onTitleChange={setTitle}
            applicationType={applicationType}
            onTypeChange={handleTypeChange}
            selectedUser={selectedUser}
            onResetRecipient={resetRecipient}
            userSearchOpen={userSearchOpen}
            onUserSearchOpenChange={setUserSearchOpen}
            onUserSelect={handleUserSelect}
            testId={testId}
            onTestIdChange={setTestId}
            privateTests={privateTests}
            hideResultsFromParticipant={hideResultsFromParticipant}
            onHideResultsFromParticipantChange={setHideResultsFromParticipant}
            creating={creating}
            onSubmit={(e) => void handleCreate(e)}
          />

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

          <MyApplicationsSection
            items={items}
            page={page}
            totalPages={totalPages}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            copiedToken={copiedToken}
            onCopy={(token) => void handleCopy(token)}
            onPageChange={setPage}
          />
        </>
      )}

      {tab === 'incoming' && (
        <IncomingApplicationsSection
          items={incomingItems}
          page={incomingPage}
          totalPages={incomingTotalPages}
          hasPreviousPage={incomingHasPreviousPage}
          hasNextPage={incomingHasNextPage}
          onPageChange={setIncomingPage}
        />
      )}
    </section>
  );
}
