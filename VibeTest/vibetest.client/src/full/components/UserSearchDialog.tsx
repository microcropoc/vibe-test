import { useEffect, useRef, useState } from 'react';
import { usersApi } from '@/full/api';
import { getApiErrorMessage } from '@/full/context/AuthContext';
import type { UserSearchResult } from '@/types';

type UserSearchDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (user: UserSearchResult) => void;
};

export function UserSearchDialog({ open, onClose, onSelect }: UserSearchDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
      setQuery('');
      setResults([]);
      setError(null);
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const timer = window.setTimeout(() => {
      void (async () => {
        setSearching(true);
        setError(null);
        try {
          const users = await usersApi.search(trimmed);
          setResults(users);
        } catch (err) {
          setError(getApiErrorMessage(err));
          setResults([]);
        } finally {
          setSearching(false);
        }
      })();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [open, query]);

  function handleSelect(user: UserSearchResult) {
    onSelect(user);
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className="full-dialog"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="full-dialog__panel">
        <div className="full-dialog__header">
          <h2 className="full-dialog__title">Выбор пользователя</h2>
          <button type="button" className="full-button full-button--ghost" onClick={onClose}>
            Закрыть
          </button>
        </div>
        <label className="full-form__label">
          Поиск по имени или email
          <input
            className="full-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Минимум 2 символа"
            autoFocus
          />
        </label>
        {error && <p className="full-error">{error}</p>}
        {searching && <p className="full-muted">Поиск…</p>}
        {!searching && query.trim().length >= 2 && results.length === 0 && !error && (
          <p className="full-muted">Пользователи не найдены.</p>
        )}
        <ul className="full-list" style={{ marginTop: '1rem' }}>
          {results.map((user) => (
            <li key={user.id} className="full-list__item">
              <div className="full-list__title">{user.displayName}</div>
              <button
                type="button"
                className="full-button"
                style={{ marginTop: '0.5rem' }}
                onClick={() => handleSelect(user)}
              >
                Выбрать
              </button>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
