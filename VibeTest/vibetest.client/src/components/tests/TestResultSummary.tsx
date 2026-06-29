import type { TestResultResponse } from '@/types';
import '@/components/tests/tests.css';

interface TestResultSummaryProps {
  testName: string;
  totalQuestions: number;
  correctAnswers: number;
  completedAt?: string;
  variant?: 'full' | 'submitted';
  onRetry?: () => void;
  onExit?: () => void;
  exitLabel?: string;
}

export function TestResultSummary({
  testName,
  totalQuestions,
  correctAnswers,
  completedAt,
  variant = 'full',
  onRetry,
  onExit,
  exitLabel = 'К списку',
}: TestResultSummaryProps) {
  if (variant === 'submitted') {
    return (
      <section className="vt-result vt-card">
        <h2>Тест завершён</h2>
        <p className="vt-muted">{testName}</p>
        <p>Спасибо!</p>
        {onExit && (
          <div className="vt-actions">
            <button type="button" className="vt-btn" onClick={onExit}>
              {exitLabel}
            </button>
          </div>
        )}
      </section>
    );
  }

  const incorrect = totalQuestions - correctAnswers;
  const percent = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return (
    <section className="vt-result vt-card">
      <h2>Результат</h2>
      <p className="vt-muted">{testName}</p>
      <p className="vt-score">{percent}%</p>
      <p>
        Правильно: <strong>{correctAnswers}</strong> из {totalQuestions}
        {incorrect > 0 && (
          <>
            {' '}
            · ошибок: <strong>{incorrect}</strong>
          </>
        )}
      </p>
      {completedAt && (
        <p className="vt-muted">Завершено: {new Date(completedAt).toLocaleString()}</p>
      )}
      <div className="vt-actions">
        {onRetry && (
          <button type="button" className="vt-btn vt-btn--ghost" onClick={onRetry}>
            Пройти снова
          </button>
        )}
        {onExit && (
          <button type="button" className="vt-btn" onClick={onExit}>
            {exitLabel}
          </button>
        )}
      </div>
    </section>
  );
}

export function resultFromApi(r: TestResultResponse): Omit<TestResultSummaryProps, 'onRetry' | 'onExit'> {
  return {
    testName: r.testName,
    totalQuestions: r.totalQuestions,
    correctAnswers: r.correctAnswers,
    completedAt: r.completedAt,
  };
}
