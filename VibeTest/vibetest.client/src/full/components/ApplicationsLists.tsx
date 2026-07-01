import { Link } from 'react-router-dom';
import { Pagination } from '@/components/common/Pagination';
import type { ApplicationListItem, ApplicationType, IncomingApplicationListItem } from '@/types';
import { applicationPlayPath } from '@/utils/appPaths';

const TYPE_LABELS: Record<ApplicationType, string> = {
  link: 'по ссылке',
  internalUser: 'внутренняя',
};

type MyApplicationsSectionProps = {
  items: ApplicationListItem[];
  page: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  copiedToken: string | null;
  onCopy: (token: string) => void;
  onPageChange: (page: number) => void;
};

export function MyApplicationsSection({
  items,
  page,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  copiedToken,
  onCopy,
  onPageChange,
}: MyApplicationsSectionProps) {
  return (
    <>
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
                  onClick={() => onCopy(item.token)}
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
        onPageChange={onPageChange}
      />
    </>
  );
}

type IncomingApplicationsSectionProps = {
  items: IncomingApplicationListItem[];
  page: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
};

export function IncomingApplicationsSection({
  items,
  page,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
}: IncomingApplicationsSectionProps) {
  return (
    <>
      <h2 style={{ marginTop: '2rem' }}>Мне предложено</h2>
      {items.length === 0 ? (
        <p className="full-muted">Предложений пока нет.</p>
      ) : (
        <ul className="full-list">
          {items.map((item) => (
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
                to={applicationPlayPath(item.token)}
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
        page={page}
        totalPages={totalPages}
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        onPageChange={onPageChange}
      />
    </>
  );
}
