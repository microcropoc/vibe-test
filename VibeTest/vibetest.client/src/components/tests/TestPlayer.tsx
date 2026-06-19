import { useCallback, useEffect, useMemo, useState } from 'react';
import { testsApi } from '@/full/api';
import { getApiErrorMessage } from '@/full/context/AuthContext';
import { TestResultSummary } from '@/components/tests/TestResultSummary';
import type { PlayerPhase, PlayerProgress, PlayerQuestion } from '@/types/player';
import type { QuestionDefinition, TestResultResponse } from '@/types';
import {
  clearApiTestProgress,
  clearTestProgress,
  getApiTestProgress,
  getLocalTestById,
  getTestProgress,
  saveApiTestProgress,
  saveGuestResult,
  saveTestProgress,
} from '@/utils/storage';
import {
  countCorrect,
  getCorrectAnswerOrder,
  isTestFullyAnswered,
  toPlayerQuestions,
} from '@/utils/playerHelpers';
import '@/components/tests/tests.css';

export type TestPlayerSource =
  | { type: 'local'; testId: string }
  | { type: 'api'; testId: number };

interface TestPlayerProps {
  source: TestPlayerSource;
  onExit?: () => void;
}

function emptyProgress(): PlayerProgress {
  return { answers: {}, currentQuestionOrder: 0, updatedAt: new Date().toISOString() };
}

function loadProgress(source: TestPlayerSource): PlayerProgress {
  if (source.type === 'local') {
    return getTestProgress(source.testId) ?? emptyProgress();
  }
  return getApiTestProgress(source.testId) ?? emptyProgress();
}

function persistProgress(source: TestPlayerSource, progress: PlayerProgress): void {
  const payload = { ...progress, updatedAt: new Date().toISOString() };
  if (source.type === 'local') {
    saveTestProgress(source.testId, payload);
  } else {
    saveApiTestProgress(source.testId, payload);
  }
}

function dotClass(order: number, progress: PlayerProgress, current: number): string {
  const record = progress.answers[order];
  const classes = ['vt-question-dot'];
  if (order === current) classes.push('vt-question-dot--current');
  if (!record) classes.push('vt-question-dot--unanswered');
  else if (record.isCorrect) classes.push('vt-question-dot--correct');
  else classes.push('vt-question-dot--incorrect');
  return classes.join(' ');
}

export function TestPlayer({ source, onExit }: TestPlayerProps) {
  const [phase, setPhase] = useState<PlayerPhase>('loading');
  const [testName, setTestName] = useState('');
  const [questions, setQuestions] = useState<PlayerQuestion[]>([]);
  const [localDefinitions, setLocalDefinitions] = useState<QuestionDefinition[]>([]);
  const [progress, setProgress] = useState<PlayerProgress>(emptyProgress);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [apiResult, setApiResult] = useState<TestResultResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasNewQuestions, setHasNewQuestions] = useState(false);

  const currentOrder = progress.currentQuestionOrder;
  const currentQuestion = questions[currentOrder];
  const currentRecord = progress.answers[currentOrder];
  const showingResult = phase === 'result' && Boolean(currentRecord);

  const refreshPhase = useCallback(
    (qs: PlayerQuestion[], prog: PlayerProgress, result: TestResultResponse | null) => {
      const answered = Object.keys(prog.answers).length;
      const total = qs.length;

      if (result && result.totalQuestions < total && answered >= result.totalQuestions) {
        setHasNewQuestions(true);
        setPhase('unresolved');
        return;
      }

      if (result?.completedAt && answered >= total) {
        setPhase('completed');
        return;
      }

      if (answered >= total && total > 0) {
        setPhase('completed');
        return;
      }

      setPhase(prog.answers[prog.currentQuestionOrder] ? 'result' : 'answering');
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (source.type === 'local') {
          const test = getLocalTestById(source.testId);
          if (!test) {
            setError('Тест не найден');
            return;
          }
          const qs = toPlayerQuestions(test.questions);
          const prog = loadProgress(source);
          if (!cancelled) {
            setTestName(test.name);
            setQuestions(qs);
            setLocalDefinitions(test.questions);
            setProgress(prog);
            refreshPhase(qs, prog, null);
          }
          return;
        }

        const [detail, result] = await Promise.all([
          testsApi.getDetail(source.testId),
          testsApi.getResult(source.testId).catch(() => null),
        ]);

        if (cancelled) return;

        const sortedQuestions = [...detail.questions].sort((a, b) => a.order - b.order);
        const qs: PlayerQuestion[] = sortedQuestions.map((q, index) => ({
          order: index,
          text: q.text,
          answers: [...q.answers]
            .sort((a, b) => a.order - b.order)
            .map((a, answerIndex) => ({ order: answerIndex, text: a.text })),
        }));

        const prog = loadProgress(source);
        setTestName(detail.name);
        setQuestions(qs);
        setApiResult(result);
        setProgress(prog);
        refreshPhase(qs, prog, result);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [source, refreshPhase]);

  useEffect(() => {
    if (phase === 'completed' && source.type === 'local' && questions.length > 0) {
      const correct = countCorrect(progress);
      saveGuestResult({
        testId: source.testId,
        testName,
        totalQuestions: questions.length,
        correctAnswers: correct,
        completedAt: new Date().toISOString(),
      });
    }
  }, [phase, source, progress, questions.length, testName]);

  const completedSummary = useMemo(() => {
    if (source.type === 'api' && apiResult && phase === 'completed') {
      return {
        testName: apiResult.testName,
        totalQuestions: apiResult.totalQuestions,
        correctAnswers: apiResult.correctAnswers,
        completedAt: apiResult.completedAt,
      };
    }
    return {
      testName,
      totalQuestions: questions.length,
      correctAnswers: countCorrect(progress),
      completedAt: new Date().toISOString(),
    };
  }, [apiResult, phase, progress, questions.length, source.type, testName]);

  async function handleCheck() {
    if (selectedOrder === null || !currentQuestion) return;

    setPhase('checking');
    setError(null);

    try {
      let correctOrder: number;
      let isCorrect: boolean;

      if (source.type === 'local') {
        const def = localDefinitions[currentOrder];
        correctOrder = getCorrectAnswerOrder(def);
        isCorrect = selectedOrder === correctOrder;
      } else {
        const response = await testsApi.submitAnswer(source.testId, {
          questionOrder: currentOrder,
          selectedAnswerOrder: selectedOrder,
        });
        correctOrder = response.correctAnswerOrder;
        isCorrect = selectedOrder === correctOrder;
      }

      const nextProgress: PlayerProgress = {
        ...progress,
        answers: {
          ...progress.answers,
          [currentOrder]: {
            selectedAnswerOrder: selectedOrder,
            correctAnswerOrder: correctOrder,
            isCorrect,
          },
        },
        currentQuestionOrder: currentOrder,
        updatedAt: new Date().toISOString(),
      };

      setProgress(nextProgress);
      persistProgress(source, nextProgress);
      setPhase('result');

      if (source.type === 'api') {
        const allDone = isTestFullyAnswered(questions.length, nextProgress);
        if (allDone) {
          const result = await testsApi.getResult(source.testId);
          setApiResult(result);
          if (result.completedAt) {
            setPhase('completed');
          }
        }
      } else if (isTestFullyAnswered(questions.length, nextProgress)) {
        setPhase('completed');
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
      setPhase('answering');
    }
  }

  function goToQuestion(order: number) {
    if (order < 0 || order >= questions.length) return;
    const next: PlayerProgress = {
      ...progress,
      currentQuestionOrder: order,
      updatedAt: new Date().toISOString(),
    };
    setProgress(next);
    persistProgress(source, next);
    setSelectedOrder(next.answers[order]?.selectedAnswerOrder ?? null);
    setPhase(next.answers[order] ? 'result' : 'answering');
  }

  function handleNext() {
    const nextOrder =
      currentOrder < questions.length - 1
        ? currentOrder + 1
        : questions.findIndex((_, i) => !progress.answers[i]);

    if (nextOrder >= 0 && nextOrder < questions.length) {
      goToQuestion(nextOrder);
      return;
    }

    if (isTestFullyAnswered(questions.length, progress)) {
      if (source.type === 'api') {
        void testsApi.getResult(source.testId).then((r) => {
          setApiResult(r);
          setPhase('completed');
        });
      } else {
        setPhase('completed');
      }
    }
  }

  async function handleRetry() {
    if (source.type === 'local') {
      clearTestProgress(source.testId);
    } else {
      try {
        await testsApi.deleteResult(source.testId);
      } catch {
        /* ignore if no result */
      }
      clearApiTestProgress(source.testId);
    }
    const fresh = emptyProgress();
    setProgress(fresh);
    setApiResult(null);
    setHasNewQuestions(false);
    setSelectedOrder(null);
    setPhase('answering');
  }

  if (error && phase === 'loading') {
    return <p className="vt-error">{error}</p>;
  }

  if (phase === 'loading') {
    return <p className="vt-muted">Загрузка теста…</p>;
  }

  if (phase === 'completed') {
    return (
      <TestResultSummary
        {...completedSummary}
        onRetry={handleRetry}
        onExit={onExit}
      />
    );
  }

  if (!currentQuestion) {
    return <p className="vt-error">В тесте нет вопросов</p>;
  }

  const activeRecord = showingResult ? currentRecord : null;

  return (
    <div className="vt-player">
      <header>
        <h2>{testName}</h2>
        {hasNewQuestions && (
          <p className="vt-muted">В тест добавлены новые вопросы — дорешайте их.</p>
        )}
      </header>

      <nav className="vt-question-nav" aria-label="Вопросы">
        {questions.map((q) => (
          <button
            key={q.order}
            type="button"
            className={dotClass(q.order, progress, currentOrder)}
            onClick={() => goToQuestion(q.order)}
            title={`Вопрос ${q.order + 1}`}
          >
            {q.order + 1}
          </button>
        ))}
      </nav>

      <article className="vt-card">
        <p className="vt-muted">
          Вопрос {currentOrder + 1} из {questions.length}
        </p>
        <h3>{currentQuestion.text}</h3>

        <div className="vt-options">
          {currentQuestion.answers.map((answer) => {
            const isSelected =
              (showingResult && activeRecord?.selectedAnswerOrder === answer.order) ||
              (!showingResult && selectedOrder === answer.order);
            const isCorrectOption =
              showingResult && activeRecord?.correctAnswerOrder === answer.order;
            const isWrongSelected =
              showingResult &&
              isSelected &&
              activeRecord?.selectedAnswerOrder === answer.order &&
              !activeRecord.isCorrect;

            let optionClass = 'vt-option';
            if (isCorrectOption) optionClass += ' vt-option--correct';
            if (isWrongSelected) optionClass += ' vt-option--incorrect';

            return (
              <label key={answer.order} className={optionClass}>
                <input
                  type="radio"
                  name={`q-${currentOrder}`}
                  checked={isSelected}
                  disabled={showingResult}
                  onChange={() => setSelectedOrder(answer.order)}
                />
                <span>{answer.text}</span>
              </label>
            );
          })}
        </div>

        {showingResult && activeRecord && (
          <p className={activeRecord.isCorrect ? 'vt-muted' : 'vt-error'}>
            {activeRecord.isCorrect ? 'Верно!' : 'Неверно. Правильный ответ подсвечен.'}
          </p>
        )}

        {error && <p className="vt-error">{error}</p>}

        <div className="vt-actions">
          {currentOrder > 0 && (
            <button
              type="button"
              className="vt-btn vt-btn--ghost"
              onClick={() => goToQuestion(currentOrder - 1)}
            >
              Назад
            </button>
          )}
          {!showingResult ? (
            <button
              type="button"
              className="vt-btn"
              disabled={selectedOrder === null || phase === 'checking'}
              onClick={() => void handleCheck()}
            >
              {phase === 'checking' ? 'Проверка…' : 'Проверить'}
            </button>
          ) : (
            <button type="button" className="vt-btn" onClick={handleNext}>
              {isTestFullyAnswered(questions.length, progress) ? 'Итог' : 'Далее'}
            </button>
          )}
          {onExit && (
            <button type="button" className="vt-btn vt-btn--ghost" onClick={onExit}>
              Выйти
            </button>
          )}
        </div>
      </article>
    </div>
  );
}
