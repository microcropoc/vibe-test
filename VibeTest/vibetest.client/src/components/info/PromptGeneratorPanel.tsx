import { useState } from 'react';
import type { TestDifficulty } from '@/types';
import { buildAiTestPrompt } from '@/utils/aiPrompt';
import { copyToClipboard } from '@/utils/clipboard';
import {
  buttonClassName,
  errorClassName,
  successClassName,
} from '@/utils/pageShell';
import { TEST_DIFFICULTIES, TEST_DIFFICULTY_LABELS } from '@/utils/testDifficulty';
import '@/components/tests/tests.css';

export function PromptGeneratorPanel() {
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(20);
  const [answerCount, setAnswerCount] = useState(5);
  const [difficulty, setDifficulty] = useState<TestDifficulty>('easy');
  const [includeExplanations, setIncludeExplanations] = useState(false);
  const [explanations, setExplanations] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    setError(null);
    setCopied(false);

    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setError('Укажите тему теста');
      return;
    }

    if (!Number.isInteger(questionCount) || questionCount < 1) {
      setError('Количество вопросов должно быть целым числом не меньше 1');
      return;
    }

    if (!Number.isInteger(answerCount) || answerCount < 2) {
      setError('Количество ответов должно быть целым числом не меньше 2');
      return;
    }

    const prompt = buildAiTestPrompt({
      topic: trimmedTopic,
      questionCount,
      answerCount,
      difficulty,
      includeExplanations,
      explanations
    });

    await copyToClipboard(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="vt-editor">
      <p className="vt-muted">
        Заполните параметры и скопируйте промпт для ИИ. Полученный JSON можно импортировать на вкладке
        «Импорт» или в редакторе.
      </p>

      <div className="vt-field">
        <label htmlFor="prompt-topic">Тема</label>
        <input
          id="prompt-topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Например: основы SQL"
        />
      </div>

      <div className="vt-field">
        <label htmlFor="prompt-question-count">Количество вопросов</label>
        <input
          id="prompt-question-count"
          type="number"
          min={1}
          value={questionCount == 0 ? '' : questionCount}
          onChange={(e) => setQuestionCount(Number(e.target.value))}
        />
      </div>

      <div className="vt-field">
        <label htmlFor="prompt-answer-count">Количество ответов</label>
        <input
          id="prompt-answer-count"
          type="number"
          min={2}
          value={answerCount == 0 ? '' : answerCount}
          onChange={(e) => setAnswerCount(Number(e.target.value))}
        />
      </div>

      <div className="vt-field">
        <label htmlFor="prompt-difficulty">Сложность</label>
        <select
          id="prompt-difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as TestDifficulty)}
        >
          {TEST_DIFFICULTIES.map((level) => (
            <option key={level} value={level}>
              {TEST_DIFFICULTY_LABELS[level]}
            </option>
          ))}
        </select>
      </div>

      <div className="vt-field">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={includeExplanations}
            onChange={(e) => setIncludeExplanations(e.target.checked)}
          />
          Пояснения к ответам
        </label>
       </div>

      <div className="vt-field">
        <input
            id="prompt-explanation"
            type="text"
            value={explanations}
            onChange={(e) => setExplanations(e.target.value)}
            placeholder="Например: с примерами SQL запросов"
            disabled={!includeExplanations}
        />
      </div>

      <p>
        <button type="button" className={buttonClassName()} onClick={() => void handleCopy()}>
          Сохранить в буфер обмена
        </button>
      </p>

      {error && <p className={errorClassName()}>{error}</p>}
      {copied && <p className={successClassName()}>Скопировано в буфер обмена</p>}
    </div>
  );
}
