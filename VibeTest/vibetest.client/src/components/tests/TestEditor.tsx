import { useEffect, useState } from 'react';
import type { QuestionDefinition, TestDefinition } from '@/types';
import { testsApi } from '@/full/api';
import { getApiErrorMessage } from '@/full/context/AuthContext';
import { downloadTestJson } from '@/utils/export';
import { ImportValidationError } from '@/utils/import';
import {
  createLocalTestFromDefinition,
  getLocalTestById,
  saveLocalTest,
  updateLocalTestFromDefinition,
} from '@/utils/storage';
import {
  createEmptyQuestion,
  createEmptyTest,
  validateTestDefinition,
} from '@/utils/validateTest';
import '@/components/tests/tests.css';

type EditorPhase = 'editing' | 'preview' | 'saving';

export interface TestEditorProps {
  mode: 'local' | 'api';
  localTestId?: string;
  apiTestId?: number;
  onSaved?: (id: string | number) => void;
}

export function TestEditor({ mode, localTestId, apiTestId, onSaved }: TestEditorProps) {
  const isEdit = mode === 'local' ? Boolean(localTestId) : Boolean(apiTestId);
  const [phase, setPhase] = useState<EditorPhase>('editing');
  const [definition, setDefinition] = useState<TestDefinition>(createEmptyTest);
  const [lockedQuestions, setLockedQuestions] = useState<QuestionDefinition[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (mode === 'local' && localTestId) {
      const test = getLocalTestById(localTestId);
      if (!test) {
        setLoadError('Тест не найден');
      } else {
        setDefinition({
          name: test.name,
          description: test.description,
          questions: test.questions,
        });
      }
      setLoading(false);
      return;
    }

    if (mode === 'api' && apiTestId) {
      let cancelled = false;
      void testsApi
        .getFull(apiTestId)
        .then((full) => {
          if (cancelled) return;
          setDefinition({
            name: full.name,
            description: full.description,
            questions: [],
          });
          setLockedQuestions(
            full.questions.map((q) => ({
              text: q.text,
              answers: q.answers.map((a) => ({ text: a.text, isCorrect: a.isCorrect })),
            })),
          );
          setIsPublic(full.isPublic);
        })
        .catch((err) => {
          if (!cancelled) setLoadError(getApiErrorMessage(err));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }

    setLoading(false);
  }, [mode, localTestId, apiTestId]);

  function updateQuestion(index: number, patch: Partial<QuestionDefinition>) {
    setDefinition((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? { ...q, ...patch } : q)),
    }));
  }

  function updateAnswer(questionIndex: number, answerIndex: number, text: string) {
    setDefinition((prev) => ({
      ...prev,
      questions: prev.questions.map((q, qi) =>
        qi === questionIndex
          ? {
              ...q,
              answers: q.answers.map((a, ai) => (ai === answerIndex ? { ...a, text } : a)),
            }
          : q,
      ),
    }));
  }

  function setCorrectAnswer(questionIndex: number, answerIndex: number) {
    setDefinition((prev) => ({
      ...prev,
      questions: prev.questions.map((q, qi) =>
        qi === questionIndex
          ? {
              ...q,
              answers: q.answers.map((a, ai) => ({ ...a, isCorrect: ai === answerIndex })),
            }
          : q,
      ),
    }));
  }

  function addAnswer(questionIndex: number) {
    setDefinition((prev) => ({
      ...prev,
      questions: prev.questions.map((q, qi) =>
        qi === questionIndex
          ? { ...q, answers: [...q.answers, { text: '', isCorrect: false }] }
          : q,
      ),
    }));
  }

  function removeAnswer(questionIndex: number, answerIndex: number) {
    setDefinition((prev) => ({
      ...prev,
      questions: prev.questions.map((q, qi) => {
        if (qi !== questionIndex || q.answers.length <= 2) return q;
        const answers = q.answers.filter((_, ai) => ai !== answerIndex);
        const hasCorrect = answers.some((a) => a.isCorrect);
        if (!hasCorrect) answers[0] = { ...answers[0], isCorrect: true };
        return { ...q, answers };
      }),
    }));
  }

  function addQuestion() {
    setDefinition((prev) => ({
      ...prev,
      questions: [...prev.questions, createEmptyQuestion()],
    }));
  }

  function removeQuestion(index: number) {
    setDefinition((prev) => ({
      ...prev,
      questions:
        prev.questions.length <= 1
          ? prev.questions
          : prev.questions.filter((_, i) => i !== index),
    }));
  }

  async function handleSave() {
    setSaveError(null);
    setPhase('saving');

    try {
      if (mode === 'api' && apiTestId) {
        const toAppend = definition.questions;
        if (toAppend.length > 0) {
          validateTestDefinition({ ...definition, questions: toAppend });
        }
        await testsApi.updateInfo(apiTestId, {
          name: definition.name.trim(),
          description: definition.description?.trim() || undefined,
        });
        if (toAppend.length > 0) {
          await testsApi.appendQuestions(apiTestId, { questions: toAppend });
        }
        onSaved?.(apiTestId);
        return;
      }

      validateTestDefinition(definition);

      if (mode === 'local') {
        const saved = localTestId
          ? updateLocalTestFromDefinition(localTestId, definition)
          : createLocalTestFromDefinition(definition);
        saveLocalTest(saved);
        onSaved?.(saved.id);
        return;
      }

      const created = await testsApi.create(definition);
      onSaved?.(created.id);
    } catch (e) {
      if (e instanceof ImportValidationError) {
        setSaveError(e.message);
      } else {
        setSaveError(getApiErrorMessage(e));
      }
      setPhase('editing');
    }
  }

  if (loading) {
    return <p className="vt-muted">Загрузка редактора…</p>;
  }

  if (loadError) {
    return <p className="vt-error">{loadError}</p>;
  }

  if (phase === 'preview') {
    const allQuestions = [...lockedQuestions, ...definition.questions];
    return (
      <div className="vt-editor">
        <h2>Предпросмотр</h2>
        <p className="vt-muted">{definition.name || 'Без названия'}</p>
        {definition.description && <p>{definition.description}</p>}
        <ol className="vt-preview-list">
          {allQuestions.map((q, i) => (
            <li key={i}>
              <strong>{q.text || `Вопрос ${i + 1}`}</strong>
              <ul>
                {q.answers.map((a, ai) => (
                  <li key={ai}>
                    {a.text}
                    {a.isCorrect && <span className="vt-badge"> верно</span>}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <div className="vt-actions">
          <button type="button" className="vt-btn vt-btn--ghost" onClick={() => setPhase('editing')}>
            Назад к редактированию
          </button>
          <button type="button" className="vt-btn" onClick={() => void handleSave()}>
            Сохранить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vt-editor">
      <div className="vt-field">
        <label htmlFor="test-name">Название</label>
        <input
          id="test-name"
          value={definition.name}
          onChange={(e) => setDefinition((p) => ({ ...p, name: e.target.value }))}
          placeholder="Название теста"
        />
      </div>
      <div className="vt-field">
        <label htmlFor="test-desc">Описание</label>
        <textarea
          id="test-desc"
          value={definition.description ?? ''}
          onChange={(e) => setDefinition((p) => ({ ...p, description: e.target.value }))}
          placeholder="Необязательно"
        />
      </div>

      {mode === 'api' && isEdit && lockedQuestions.length > 0 && (
        <div className="vt-card">
          <h3 className="vt-card__title">Существующие вопросы (неизменяемы)</h3>
          {lockedQuestions.map((q, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <p>
                <strong>
                  {i + 1}. {q.text}
                </strong>
              </p>
              <ul className="vt-preview-list">
                {q.answers.map((a, ai) => (
                  <li key={ai}>
                    {a.text}
                    {a.isCorrect && <span className="vt-badge"> верно</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {definition.questions.map((question, qi) => (
        <div key={qi} className="vt-card">
          <h3 className="vt-card__title">
            {mode === 'api' && isEdit ? `Новый вопрос ${qi + 1}` : `Вопрос ${qi + 1}`}
          </h3>
          <div className="vt-field">
            <label>Текст вопроса</label>
            <textarea
              value={question.text}
              onChange={(e) => updateQuestion(qi, { text: e.target.value })}
            />
          </div>
          <div className="vt-answers">
            {question.answers.map((answer, ai) => (
              <div key={ai} className="vt-answer-row">
                <input
                  type="radio"
                  name={`correct-${qi}`}
                  checked={answer.isCorrect}
                  onChange={() => setCorrectAnswer(qi, ai)}
                  title="Правильный ответ"
                />
                <input
                  value={answer.text}
                  onChange={(e) => updateAnswer(qi, ai, e.target.value)}
                  placeholder={`Ответ ${ai + 1}`}
                />
                <button
                  type="button"
                  className="vt-btn vt-btn--ghost"
                  disabled={question.answers.length <= 2}
                  onClick={() => removeAnswer(qi, ai)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="vt-btn vt-btn--ghost" onClick={() => addAnswer(qi)}>
            + Ответ
          </button>
          {(mode === 'local' || !isEdit) && (
            <button
              type="button"
              className="vt-btn vt-btn--danger"
              style={{ marginLeft: '0.5rem' }}
              disabled={definition.questions.length <= 1}
              onClick={() => removeQuestion(qi)}
            >
              Удалить вопрос
            </button>
          )}
        </div>
      ))}

      <div className="vt-actions">
        <button type="button" className="vt-btn vt-btn--ghost" onClick={addQuestion}>
          + Вопрос
        </button>
        <button type="button" className="vt-btn vt-btn--ghost" onClick={() => setPhase('preview')}>
          Предпросмотр
        </button>
        {mode === 'local' && (
          <button
            type="button"
            className="vt-btn vt-btn--ghost"
            onClick={() => downloadTestJson(definition)}
          >
            Экспорт JSON
          </button>
        )}
        {mode === 'api' && isEdit && isPublic && (
          <span className="vt-badge">Опубликован</span>
        )}
        <button
          type="button"
          className="vt-btn"
          disabled={phase === 'saving'}
          onClick={() => void handleSave()}
        >
          {phase === 'saving' ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Создать'}
        </button>
      </div>
      {saveError && <p className="vt-error">{saveError}</p>}
    </div>
  );
}
