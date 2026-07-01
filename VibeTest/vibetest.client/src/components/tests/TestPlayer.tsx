import { useCallback, useEffect, useMemo, useState } from 'react';
import { applicationsApi, testsApi } from '@/full/api';
import { getApiErrorMessage } from '@/full/context/AuthContext';
import { TestResultSummary } from '@/components/tests/TestResultSummary';
import type { PlayerPhase, PlayerProgress, PlayerQuestion } from '@/types/player';
import type { AnsweredQuestionResponse, QuestionDefinition, TestFullResponse, TestResultResponse } from '@/types';
import {
  clearApiTestProgress,
  clearApplicationProgress,
  clearTestProgress,
  getApiTestProgress,
  getApplicationProgress,
  getLocalTestById,
  getTestProgress,
  saveApiTestProgress,
  saveApplicationProgress,
  saveGuestResult,
  saveTestProgress,
} from '@/utils/storage';
import {
  countCorrect,
  getCorrectAnswerOrder,
  isTestFullyAnswered,
  toPlayerQuestions,
} from '@/utils/playerHelpers';
import {
  getPlayerExplanationSettings,
  savePlayerExplanationSettings,
  shouldShowExplanation,
  type PlayerExplanationSettings,
} from '@/utils/playerSettings';
import '@/components/tests/tests.css';

export type TestPlayerSource =
  | { type: 'local'; testId: string }
  | { type: 'api'; testId: number; authenticated?: boolean }
  | { type: 'application'; token: string; hideResults?: boolean; isCompleted?: boolean };

interface TestPlayerProps {
  source: TestPlayerSource;
  onExit?: () => void;
}

function emptyProgress(): PlayerProgress {
  return { answers: {}, currentQuestionOrder: 0, updatedAt: new Date().toISOString() };
}

function isAuthenticatedApiSource(source: TestPlayerSource): boolean {
  return source.type === 'api' && source.authenticated !== false;
}

function isGuestApiSource(source: TestPlayerSource): boolean {
  return source.type === 'api' && source.authenticated === false;
}

function loadProgress(source: TestPlayerSource): PlayerProgress {
  if (source.type === 'local') {
    return getTestProgress(source.testId) ?? emptyProgress();
  }
  if (source.type === 'application') {
    return getApplicationProgress(source.token) ?? emptyProgress();
  }
  if (isGuestApiSource(source)) {
    return getApiTestProgress(source.testId) ?? emptyProgress();
  }
  return emptyProgress();
}

function persistProgress(source: TestPlayerSource, progress: PlayerProgress): void {
  const payload = { ...progress, updatedAt: new Date().toISOString() };
  if (source.type === 'local') {
    saveTestProgress(source.testId, payload);
  } else if (source.type === 'application') {
    saveApplicationProgress(source.token, payload);
  } else if (isGuestApiSource(source)) {
    saveApiTestProgress(source.testId, payload);
  }
}

function definitionsFromPublicPlay(full: TestFullResponse): QuestionDefinition[] {
  return [...full.questions]
    .sort((a, b) => a.order - b.order)
    .map((question) => ({
      text: question.text,
      answers: question.answers,
      correct: question.correct,
      ...(question.explanation ? { explanation: question.explanation } : {}),
    }));
}

const ALREADY_ANSWERED_MESSAGE = 'На этот вопрос уже дан ответ';

function isAlreadyAnsweredError(err: unknown): boolean {
  return getApiErrorMessage(err) === ALREADY_ANSWERED_MESSAGE;
}

function progressFromServerAnswers(
  answers: AnsweredQuestionResponse[],
  totalQuestions: number,
): PlayerProgress {
  const answerMap: PlayerProgress['answers'] = {};
  for (const answer of answers) {
    answerMap[answer.questionOrder] = {
      selectedAnswerOrder: answer.selectedAnswerOrder,
      correctAnswerOrder: answer.correctAnswerOrder,
      isCorrect: answer.isCorrect,
      ...(answer.explanation ? { explanation: answer.explanation } : {}),
    };
  }

  const firstUnanswered =
    Array.from({ length: totalQuestions }, (_, index) => index).find(
      (index) => !answerMap[index],
    ) ?? 0;

  return {
    answers: answerMap,
    currentQuestionOrder: firstUnanswered,
    updatedAt: new Date().toISOString(),
  };
}

function resolveProgressFromSources(
  local: PlayerProgress,
  server: PlayerProgress,
): PlayerProgress {
  const localCount = Object.keys(local.answers).length;
  const serverCount = Object.keys(server.answers).length;
  if (localCount === 0 || serverCount > localCount) {
    return server;
  }
  return local;
}

function dotClass(
  order: number,
  progress: PlayerProgress,
  current: number,
  hideResults = false,
): string {
  const record = progress.answers[order];
  const classes = ['vt-question-dot'];
  if (order === current) classes.push('vt-question-dot--current');
  if (!record) classes.push('vt-question-dot--unanswered');
  else if (hideResults) classes.push('vt-question-dot--answered');
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
  const [explanationSettings, setExplanationSettings] = useState<PlayerExplanationSettings>(
    getPlayerExplanationSettings,
  );
  const [applicationHideResults, setApplicationHideResults] = useState(
    () => source.type === 'application' && Boolean(source.hideResults),
  );
  const [applicationIsCompleted, setApplicationIsCompleted] = useState(
    () => source.type === 'application' && Boolean(source.isCompleted),
  );

  const currentOrder = progress.currentQuestionOrder;
  const currentQuestion = questions[currentOrder];
  const currentRecord = progress.answers[currentOrder];
  const showingResult = phase === 'result' && Boolean(currentRecord);

  const refreshPhase = useCallback(
    (
      qs: PlayerQuestion[],
      prog: PlayerProgress,
      result: TestResultResponse | null,
      options?: { hideResults?: boolean; serverCompleted?: boolean },
    ) => {
      const answered = Object.keys(prog.answers).length;
      const total = qs.length;
      const hideResults = options?.hideResults ?? false;
      const serverCompleted = options?.serverCompleted ?? false;

      if (serverCompleted || (hideResults && answered >= total && total > 0)) {
        setPhase('completed');
        return;
      }

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

        if (source.type === 'application') {
          const detail = await applicationsApi.getDetail(source.token);
          const hideResults = detail.hideResultsFromParticipant;
          const serverCompleted = detail.isCompleted;
          const [result, serverAnswers] = await Promise.all([
            hideResults
              ? Promise.resolve(null)
              : applicationsApi.getResult(source.token).catch(() => null),
            serverCompleted
              ? Promise.resolve({ answers: [] })
              : applicationsApi.getAnswers(source.token).catch(() => ({ answers: [] })),
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

          const localProg = serverCompleted ? emptyProgress() : loadProgress(source);
          if (serverCompleted) {
            clearApplicationProgress(source.token);
          }
          const serverProg = progressFromServerAnswers(serverAnswers.answers, qs.length);
          const prog = serverCompleted
            ? localProg
            : resolveProgressFromSources(localProg, serverProg);
          if (!serverCompleted && prog !== localProg) {
            persistProgress(source, prog);
          }
          setTestName(detail.name);
          setQuestions(qs);
          setApiResult(result);
          setApplicationHideResults(hideResults);
          setApplicationIsCompleted(serverCompleted);
          setProgress(prog);
          refreshPhase(qs, prog, result, { hideResults, serverCompleted });
          return;
        }

        if (isGuestApiSource(source)) {
          const full = await testsApi.getPublicPlay(source.testId);
          if (cancelled) return;

          const definitions = definitionsFromPublicPlay(full);
          const qs = toPlayerQuestions(definitions);
          const prog = loadProgress(source);

          setTestName(full.name);
          setQuestions(qs);
          setLocalDefinitions(definitions);
          setApiResult(null);
          setProgress(prog);
          refreshPhase(qs, prog, null);
          return;
        }

        const [detail, result, serverAnswers] = await Promise.all([
          testsApi.getDetail(source.testId),
          testsApi.getResult(source.testId).catch(() => null),
          testsApi.getAnswers(source.testId).catch(() => ({ answers: [] })),
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

        const serverProg = progressFromServerAnswers(serverAnswers.answers, qs.length);
        setTestName(detail.name);
        setQuestions(qs);
        setLocalDefinitions([]);
        setApiResult(result);
        setProgress(serverProg);
        refreshPhase(qs, serverProg, result);
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
    if (source.type === 'application' && applicationHideResults && phase === 'completed') {
      return {
        testName,
        totalQuestions: questions.length,
        correctAnswers: 0,
        variant: 'submitted' as const,
      };
    }
    if ((source.type === 'api' || source.type === 'application') && apiResult && phase === 'completed') {
      return {
        testName: apiResult.testName,
        totalQuestions: apiResult.totalQuestions,
        correctAnswers: apiResult.correctAnswers,
        completedAt: apiResult.completedAt,
        variant: 'full' as const,
      };
    }
    if (source.type === 'application' && applicationIsCompleted && phase === 'completed') {
      return {
        testName,
        totalQuestions: questions.length,
        correctAnswers: 0,
        variant: 'submitted' as const,
      };
    }
    return {
      testName,
      totalQuestions: questions.length,
      correctAnswers: countCorrect(progress),
      completedAt: new Date().toISOString(),
      variant: 'full' as const,
    };
  }, [
    apiResult,
    applicationHideResults,
    applicationIsCompleted,
    phase,
    progress,
    questions.length,
    source.type,
    testName,
  ]);

  const goToQuestion = useCallback(
    (order: number) => {
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
    },
    [progress, questions.length, source],
  );

  const handleReviewAnswers = useCallback(() => {
    goToQuestion(0);
  }, [goToQuestion]);

  const canReviewAnswers =
    !applicationHideResults && Object.keys(progress.answers).length > 0;

  const handleNext = useCallback(() => {
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
        if (isGuestApiSource(source)) {
          setPhase('completed');
        } else {
          void testsApi.getResult(source.testId).then((r) => {
            setApiResult(r);
            setPhase('completed');
          });
        }
      } else if (source.type === 'application') {
        if (applicationHideResults) {
          setApplicationIsCompleted(true);
          clearApplicationProgress(source.token);
          setPhase('completed');
        } else {
          void applicationsApi.getResult(source.token)
            .then((r) => {
              setApiResult(r);
              clearApplicationProgress(source.token);
              setPhase('completed');
            })
            .catch((err) => {
              setError(getApiErrorMessage(err));
            });
        }
      } else {
        setPhase('completed');
      }
    }
  }, [applicationHideResults, currentOrder, goToQuestion, progress, questions, source]);

  async function handleAnswer(answerOrder: number) {
    if (showingResult || phase === 'checking' || !currentQuestion) return;

    setSelectedOrder(answerOrder);
    setPhase('checking');
    setError(null);

    try {
      let correctOrder: number;
      let isCorrect: boolean;
      let explanation: string | undefined;

      if (source.type === 'local' || isGuestApiSource(source)) {
        const def = localDefinitions[currentOrder];
        correctOrder = getCorrectAnswerOrder(def);
        isCorrect = answerOrder === correctOrder;
        explanation = def.explanation;
      } else if (source.type === 'application') {
        const response = await applicationsApi.submitAnswer(source.token, {
          questionOrder: currentOrder,
          selectedAnswerOrder: answerOrder,
        });
        if (applicationHideResults) {
          correctOrder = answerOrder;
          isCorrect = true;
          explanation = undefined;
        } else {
          correctOrder = response.correctAnswerOrder;
          isCorrect = answerOrder === correctOrder;
          explanation = response.explanation;
        }
      } else {
        const response = await testsApi.submitAnswer(source.testId, {
          questionOrder: currentOrder,
          selectedAnswerOrder: answerOrder,
        });
        correctOrder = response.correctAnswerOrder;
        isCorrect = answerOrder === correctOrder;
        explanation = response.explanation;
      }

      const nextProgress: PlayerProgress = {
        ...progress,
        answers: {
          ...progress.answers,
          [currentOrder]: {
            selectedAnswerOrder: answerOrder,
            correctAnswerOrder: correctOrder,
            isCorrect,
            ...(explanation ? { explanation } : {}),
          },
        },
        currentQuestionOrder: currentOrder,
        updatedAt: new Date().toISOString(),
      };

      setProgress(nextProgress);
      persistProgress(source, nextProgress);
      setPhase('result');

      if (source.type === 'api' && isAuthenticatedApiSource(source)) {
        const allDone = isTestFullyAnswered(questions.length, nextProgress);
        if (allDone) {
          const result = await testsApi.getResult(source.testId);
          setApiResult(result);
        }
      } else if (source.type === 'application') {
        const allDone = isTestFullyAnswered(questions.length, nextProgress);
        if (allDone) {
          if (applicationHideResults) {
            setApplicationIsCompleted(true);
            clearApplicationProgress(source.token);
          } else {
            const result = await applicationsApi.getResult(source.token);
            setApiResult(result);
            clearApplicationProgress(source.token);
          }
        }
      }
    } catch (err) {
      if (
        ((source.type === 'api' && isAuthenticatedApiSource(source)) || source.type === 'application') &&
        isAlreadyAnsweredError(err)
      ) {
        try {
          const serverAnswers =
            source.type === 'api'
              ? await testsApi.getAnswers(source.testId)
              : await applicationsApi.getAnswers(source.token);
          const restored = progressFromServerAnswers(serverAnswers.answers, questions.length);
          const existing = restored.answers[currentOrder];
          if (existing) {
            const nextProgress: PlayerProgress = {
              ...restored,
              currentQuestionOrder: currentOrder,
              updatedAt: new Date().toISOString(),
            };
            setProgress(nextProgress);
            if (source.type === 'application') {
              persistProgress(source, nextProgress);
            }
            setSelectedOrder(existing.selectedAnswerOrder);
            setPhase('result');
            setError(null);
            return;
          }
        } catch {
          /* fall through to generic error */
        }
      }
      setError(getApiErrorMessage(err));
      setPhase('answering');
    }
  }

  async function handleRetry() {
    if (source.type === 'application') return;

    if (source.type === 'local') {
      clearTestProgress(source.testId);
    } else if (isGuestApiSource(source)) {
      clearApiTestProgress(source.testId);
    } else {
      try {
        await testsApi.deleteResult(source.testId);
      } catch {
        /* ignore if no result */
      }
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
        onReviewAnswers={canReviewAnswers ? handleReviewAnswers : undefined}
        onRetry={source.type === 'application' ? undefined : handleRetry}
        onExit={onExit}
      />
    );
  }

  if (!currentQuestion) {
    return <p className="vt-error">В тесте нет вопросов</p>;
  }

  function updateExplanationSettings(patch: Partial<PlayerExplanationSettings>) {
    setExplanationSettings((current) => {
      const next = { ...current, ...patch };
      savePlayerExplanationSettings(next);
      return next;
    });
  }

  const activeRecord = showingResult ? currentRecord : null;
  const isChecking = phase === 'checking';
  const showNavOverlay = showingResult || isChecking;
  const canGoNext = showingResult;
  const canGoBack = currentOrder > 0;
  const nextLabel = 'Далее';

  const rawExplanation =
    showingResult && activeRecord
      ? source.type === 'local' || isGuestApiSource(source)
        ? localDefinitions[currentOrder]?.explanation
        : activeRecord.explanation
      : undefined;

  const explanationText =
    showingResult && activeRecord && !applicationHideResults
      ? shouldShowExplanation(explanationSettings, activeRecord.isCorrect, rawExplanation)
        ? rawExplanation?.trim()
        : undefined
      : undefined;

  return (
    <div
      className="vt-player"
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
    >
      <header>
        <h2>{testName}</h2>
        {hasNewQuestions && (
          <p className="vt-muted">В тест добавлены новые вопросы — дорешайте их.</p>
        )}
        {!applicationHideResults && (
          <details className="vt-player-settings">
            <summary className="vt-player-settings__summary">Настройки пояснений</summary>
            <div className="vt-player-settings__body">
              <label className="vt-player-settings__label">
                <input
                  type="checkbox"
                  checked={explanationSettings.showOnCorrect}
                  onChange={(e) => updateExplanationSettings({ showOnCorrect: e.target.checked })}
                />
                Показывать при правильном ответе
              </label>
              <label className="vt-player-settings__label">
                <input
                  type="checkbox"
                  checked={explanationSettings.showOnIncorrect}
                  onChange={(e) => updateExplanationSettings({ showOnIncorrect: e.target.checked })}
                />
                Показывать при неправильном ответе
              </label>
            </div>
          </details>
        )}
      </header>

      <nav className="vt-question-nav" aria-label="Вопросы">
        {questions.map((q) => (
          <button
            key={q.order}
            type="button"
            className={dotClass(q.order, progress, currentOrder, applicationHideResults)}
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
              !applicationHideResults &&
              showingResult &&
              activeRecord?.correctAnswerOrder === answer.order;
            const isWrongSelected =
              !applicationHideResults &&
              showingResult &&
              isSelected &&
              activeRecord?.selectedAnswerOrder === answer.order &&
              !activeRecord.isCorrect;

            let optionClass = 'vt-option';
            if (applicationHideResults && isSelected && showingResult) {
              optionClass += ' vt-option--selected';
            } else {
              if (isCorrectOption) optionClass += ' vt-option--correct';
              if (isWrongSelected) optionClass += ' vt-option--incorrect';
            }

            return (
              <label key={answer.order} className={optionClass}>
                <input
                  type="radio"
                  name={`q-${currentOrder}`}
                  checked={isSelected}
                  disabled={showingResult || phase === 'checking'}
                  onChange={() => void handleAnswer(answer.order)}
                />
                <span>{answer.text}</span>
              </label>
            );
          })}
        </div>

        {explanationText && (
          <p className="vt-explanation">{explanationText}</p>
        )}

        {error && <p className="vt-error">{error}</p>}

        {showNavOverlay && (
          <div
            className="vt-card__overlay"
            role="button"
            tabIndex={showingResult ? 0 : -1}
            aria-label="Следующий вопрос"
            aria-disabled={!showingResult || isChecking}
            onClick={() => {
              if (showingResult && !isChecking) handleNext();
            }}
            onKeyDown={(e) => {
              if (showingResult && !isChecking && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleNext();
              }
            }}
          />
        )}
      </article>

      <div className="vt-player__toolbar">
        <div className="vt-player__nav">
          <button
            type="button"
            className="vt-btn vt-btn--ghost"
            onClick={() => goToQuestion(currentOrder - 1)}
            disabled={!canGoBack || isChecking}
          >
            Назад
          </button>
          <button
            type="button"
            className="vt-btn"
            onClick={handleNext}
            disabled={!canGoNext || isChecking}
          >
            {nextLabel}
          </button>
        </div>
        {onExit && (
          <button
            type="button"
            className="vt-btn vt-btn--ghost vt-player__exit-btn"
            onClick={onExit}
            disabled={isChecking}
          >
            Выйти
          </button>
        )}
      </div>
    </div>
  );
}
