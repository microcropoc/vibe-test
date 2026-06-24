import { useEffect, useMemo, useState } from 'react';
import type { QuestionDefinition, TestDefinition } from '@/types';
import { Pagination } from '@/components/common/Pagination';
import { TestImportPanel } from '@/components/tests/TestImportPanel';
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
  clampPage,
  getPageSlice,
  PAGE_SIZES,
  type PageSize,
} from '@/utils/pagination';
import { normalizeQuestions } from '@/utils/normalizeQuestions';
import {
  createEmptyQuestion,
  createEmptyTest,
  validateTestDefinition,
} from '@/utils/validateTest';
import '@/components/tests/tests.css';

type EditorPhase = 'editing' | 'preview' | 'saving';

function isEmptyQuestion(question: QuestionDefinition): boolean {
  return !question.text.trim() && question.answers.every((answer) => !answer.trim());
}

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
  const [questionsPageSize, setQuestionsPageSize] = useState<PageSize>(10);
  const [editablePage, setEditablePage] = useState(1);
  const [lockedPage, setLockedPage] = useState(1);
  useEffect(() => {
    setEditablePage((page) => clampPage(page, definition.questions.length, questionsPageSize));
  }, [definition.questions.length, questionsPageSize]);

  useEffect(() => {
    setLockedPage((page) => clampPage(page, lockedQuestions.length, questionsPageSize));
  }, [lockedQuestions.length, questionsPageSize]);

  const lockedSlice = useMemo(
    () => getPageSlice(lockedQuestions, lockedPage, questionsPageSize),
    [lockedQuestions, lockedPage, questionsPageSize],
  );

  const editableSlice = useMemo(
    () => getPageSlice(definition.questions, editablePage, questionsPageSize),
    [definition.questions, editablePage, questionsPageSize],
  );

  useEffect(() => {
    if (mode === 'local' && localTestId) {
      const test = getLocalTestById(localTestId);
      if (!test) {
        setLoadError('Тест не найден');
      } else {
        setDefinition({
          name: test.name,
          description: test.description,
          questions: normalizeQuestions(test.questions),
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
              answers: q.answers,
              correct: q.correct,
              ...(q.explanation ? { explanation: q.explanation } : {}),
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
              answers: q.answers.map((a, ai) => (ai === answerIndex ? text : a)),
            }
          : q,
      ),
    }));
  }

  function setCorrectAnswer(questionIndex: number, answerIndex: number) {
    setDefinition((prev) => ({
      ...prev,
      questions: prev.questions.map((q, qi) =>
        qi === questionIndex ? { ...q, correct: answerIndex } : q,
      ),
    }));
  }

  function addAnswer(questionIndex: number) {
    setDefinition((prev) => ({
      ...prev,
      questions: prev.questions.map((q, qi) =>
        qi === questionIndex ? { ...q, answers: [...q.answers, ''] } : q,
      ),
    }));
  }

  function removeAnswer(questionIndex: number, answerIndex: number) {
    setDefinition((prev) => ({
      ...prev,
      questions: prev.questions.map((q, qi) => {
        if (qi !== questionIndex || q.answers.length <= 2) return q;
        const answers = q.answers.filter((_, ai) => ai !== answerIndex);
        let correct = q.correct;
        if (answerIndex < correct) correct -= 1;
        else if (answerIndex === correct) correct = 0;
        return { ...q, answers, correct };
      }),
    }));
  }

  function addQuestion() {
    setDefinition((prev) => {
      const questions = [...prev.questions, createEmptyQuestion()];
      setEditablePage(Math.ceil(questions.length / questionsPageSize));
      return { ...prev, questions };
    });
  }

  function handleAppendImported(imported: QuestionDefinition[]) {
    setDefinition((prev) => {
      let existing = prev.questions;
      if (existing.length === 1 && isEmptyQuestion(existing[0])) {
        existing = [];
      }
      const questions = [...existing, ...imported];
      setEditablePage(Math.ceil(questions.length / questionsPageSize) || 1);
      return { ...prev, questions };
    });
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

  function handleExportJson() {
    const exportDefinition: TestDefinition = {
      name: definition.name,
      description: definition.description,
      questions:
        mode === 'api' && isEdit
          ? [...lockedQuestions, ...definition.questions]
          : definition.questions,
    };
    downloadTestJson(exportDefinition);
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
                {q.answers.map((text, ai) => (
                  <li key={ai}>
                    {text}
                    {ai === q.correct && <span className="vt-badge"> верно</span>}
                  </li>
                ))}
              </ul>
              {q.explanation && (
                <p className="vt-muted" style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>
                  Пояснение: {q.explanation}
                </p>
              )}
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

      <TestImportPanel onAppend={handleAppendImported} />

      {mode === 'api' && isEdit && lockedQuestions.length > 0 && (
        <div className="vt-card">
          <h3 className="vt-card__title">Существующие вопросы (неизменяемы)</h3>
          {lockedSlice.items.map((q, i) => {
            const questionNumber = lockedSlice.start + i + 1;
            return (
              <div key={questionNumber} style={{ marginBottom: '1rem' }}>
                <p>
                  <strong>
                    {questionNumber}. {q.text}
                  </strong>
                </p>
                <ul className="vt-preview-list">
                  {q.answers.map((text, ai) => (
                    <li key={ai}>
                      {text}
                      {ai === q.correct && <span className="vt-badge"> верно</span>}
                    </li>
                  ))}
                </ul>
                {q.explanation && (
                  <p className="vt-muted" style={{ fontStyle: 'italic', marginTop: '0.25rem' }}>
                    Пояснение: {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
          <Pagination
            page={lockedSlice.page}
            totalPages={lockedSlice.totalPages}
            hasPreviousPage={lockedSlice.hasPreviousPage}
            hasNextPage={lockedSlice.hasNextPage}
            onPageChange={setLockedPage}
          />
        </div>
      )}

      <div className="vt-editor__questions-toolbar">
        <span className="vt-muted">
          {mode === 'api' && isEdit
            ? `Новых вопросов: ${definition.questions.length}`
            : `Вопросов: ${definition.questions.length}`}
        </span>
        <label className="vt-editor__page-size" htmlFor="questions-page-size">
          На странице
          <select
            id="questions-page-size"
            value={questionsPageSize}
            onChange={(e) => {
              setQuestionsPageSize(Number(e.target.value) as PageSize);
              setEditablePage(1);
              setLockedPage(1);
            }}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      {editableSlice.items.map((question, i) => {
        const qi = editableSlice.start + i;
        return (
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
          <div className="vt-field">
            <label>Пояснение (необязательно)</label>
            <textarea
              value={question.explanation ?? ''}
              onChange={(e) =>
                updateQuestion(qi, {
                  explanation: e.target.value.trim() === '' ? undefined : e.target.value,
                })
              }
              placeholder="Показывается после ответа (настройки — в прохождении)"
            />
          </div>
          <div className="vt-answers">
            {question.answers.map((text, ai) => (
              <div key={ai} className="vt-answer-row">
                <input
                  type="radio"
                  name={`correct-${qi}`}
                  checked={question.correct === ai}
                  onChange={() => setCorrectAnswer(qi, ai)}
                  title="Правильный ответ"
                />
                <input
                  value={text}
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
        );
      })}

      <Pagination
        page={editableSlice.page}
        totalPages={editableSlice.totalPages}
        hasPreviousPage={editableSlice.hasPreviousPage}
        hasNextPage={editableSlice.hasNextPage}
        onPageChange={setEditablePage}
      />

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
            onClick={handleExportJson}
          >
            Экспорт JSON
          </button>
        )}
        {mode === 'api' && isEdit && (
          <button
            type="button"
            className="vt-btn vt-btn--ghost"
            onClick={handleExportJson}
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
