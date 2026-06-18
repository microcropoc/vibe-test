import { useEffect, useState } from 'react';
import { resultsApi, testsApi } from '@/full/api';
import { getApiErrorMessage } from '@/full/context/AuthContext';
import type { TestHistoryItem, UserStatsResponse } from '@/types';

export function ProfilePage() {
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [history, setHistory] = useState<TestHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [statsData, historyData] = await Promise.all([
          testsApi.getMyStats(),
          resultsApi.getHistory(1, 10),
        ]);
        if (!cancelled) {
          setStats(statsData);
          setHistory(historyData.items);
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
  }, []);

  return (
    <section className="full-page">
      <h1>Профиль</h1>
      {error && <p className="full-error">{error}</p>}

      {stats && (
        <div className="full-stats">
          <div className="full-stat">
            <div className="full-stat__value">{stats.totalCreated}</div>
            <div className="full-stat__label">Создано</div>
          </div>
          <div className="full-stat">
            <div className="full-stat__value">{stats.totalPublished}</div>
            <div className="full-stat__label">Опубликовано</div>
          </div>
          <div className="full-stat">
            <div className="full-stat__value">{stats.totalPassed}</div>
            <div className="full-stat__label">Пройдено</div>
          </div>
          <div className="full-stat">
            <div className="full-stat__value">{stats.averageScore.toFixed(1)}%</div>
            <div className="full-stat__label">Средний балл</div>
          </div>
        </div>
      )}

      <h2 style={{ marginTop: '2rem' }}>История</h2>
      {history.length === 0 ? (
        <p className="full-muted">Пока нет завершённых прохождений.</p>
      ) : (
        <ul className="full-list">
          {history.map((item) => (
            <li key={item.testId} className="full-list__item">
              <div className="full-list__title">{item.testName}</div>
              <div className="full-list__meta">
                {item.correctAnswers}/{item.totalQuestions} · {item.scorePercent.toFixed(0)}% ·{' '}
                {new Date(item.completedAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
