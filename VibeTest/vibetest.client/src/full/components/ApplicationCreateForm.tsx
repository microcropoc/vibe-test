import type { FormEvent } from 'react';
import { UserSearchDialog } from '@/full/components/UserSearchDialog';
import type { ApplicationType, TestListItem, UserSearchResult } from '@/types';

type ApplicationCreateFormProps = {
  title: string;
  onTitleChange: (value: string) => void;
  applicationType: ApplicationType;
  onTypeChange: (value: ApplicationType) => void;
  selectedUser: UserSearchResult | null;
  onResetRecipient: () => void;
  userSearchOpen: boolean;
  onUserSearchOpenChange: (open: boolean) => void;
  onUserSelect: (user: UserSearchResult) => void;
  testId: number | '';
  onTestIdChange: (value: number | '') => void;
  privateTests: TestListItem[];
  hideResultsFromParticipant: boolean;
  onHideResultsFromParticipantChange: (value: boolean) => void;
  creating: boolean;
  onSubmit: (event: FormEvent) => void;
};

export function ApplicationCreateForm({
  title,
  onTitleChange,
  applicationType,
  onTypeChange,
  selectedUser,
  onResetRecipient,
  userSearchOpen,
  onUserSearchOpenChange,
  onUserSelect,
  testId,
  onTestIdChange,
  privateTests,
  hideResultsFromParticipant,
  onHideResultsFromParticipantChange,
  creating,
  onSubmit,
}: ApplicationCreateFormProps) {
  return (
    <>
      <form
        onSubmit={onSubmit}
        className="full-form"
        style={{ maxWidth: '28rem' }}
      >
        <label className="full-form__label">
          Название заявки
          <input
            className="full-input"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
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
              onChange={() => onTypeChange('link')}
            />
            По ссылке
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="radio"
              name="applicationType"
              value="internalUser"
              checked={applicationType === 'internalUser'}
              onChange={() => onTypeChange('internalUser')}
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
                  onClick={onResetRecipient}
                >
                  Сбросить
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="full-button full-button--ghost"
                onClick={() => onUserSearchOpenChange(true)}
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
            onChange={(e) => onTestIdChange(Number(e.target.value))}
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
            onChange={(e) => onHideResultsFromParticipantChange(e.target.checked)}
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

      <UserSearchDialog
        open={userSearchOpen}
        onClose={() => onUserSearchOpenChange(false)}
        onSelect={onUserSelect}
      />
    </>
  );
}
