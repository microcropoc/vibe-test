import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PromptGeneratorPanel } from '@/components/info/PromptGeneratorPanel';
import { copyToClipboard } from '@/utils/clipboard';
import { formatImportTestTemplate } from '@/utils/importTemplate';
import {
  buttonClassName,
  pageClassName,
  successClassName,
} from '@/utils/pageShell';
import '@/guest/components/layout/GuestLayout.css';

const TEMPLATE_JSON = formatImportTestTemplate();

export type InfoTab = 'format' | 'prompt';

export function parseInfoTab(search: string): InfoTab {
  return new URLSearchParams(search).get('tab') === 'prompt' ? 'prompt' : 'format';
}

export function InfoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseInfoTab(searchParams.toString());
  const [copied, setCopied] = useState(false);

  function switchTab(nextTab: InfoTab) {
    if (nextTab === 'format') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: 'prompt' });
    }
  }

  async function handleCopyTemplate() {
    await copyToClipboard(TEMPLATE_JSON);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const tabButtonClass = (active: boolean) =>
    `${buttonClassName()} ${active ? '' : buttonClassName('ghost')}`.trim();

  return (
    <section className={pageClassName()}>
      <h1>Инфо</h1>

      <div className="full-filters" style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
        <button
          type="button"
          className={tabButtonClass(tab === 'format')}
          onClick={() => switchTab('format')}
        >
          Формат JSON
        </button>
        <button
          type="button"
          className={tabButtonClass(tab === 'prompt')}
          onClick={() => switchTab('prompt')}
        >
          Генерировать промт
        </button>
      </div>

      {tab === 'format' && (
        <>
          <p>
            Тест описывается объектом JSON. Поле <code>name</code> обязательно,{' '}
            <code>description</code> — опционально. Необязательное поле <code>difficulty</code> — сложность
            теста: <code>easy</code> (лёгкий), <code>medium</code> (средний) или <code>hard</code>{' '}
            (сложный); если не указано, считается лёгким. Массив <code>questions</code> содержит вопросы с
            полем <code>text</code>; у каждого вопроса массив строк <code>answers</code> и число{' '}
            <code>correct</code> — индекс правильного ответа (с нуля). Необязательное поле{' '}
            <code>explanation</code> — пояснение к правильному ответу; показывается после ответа
            (по умолчанию и при верном, и при неверном; в прохождении можно отключить в настройках).
          </p>

          <pre className="guest-code">{TEMPLATE_JSON}</pre>

          <p>
            <button type="button" className={buttonClassName()} onClick={() => void handleCopyTemplate()}>
              Добавить в буфер обмена
            </button>
          </p>
          {copied && <p className={successClassName()}>Скопировано в буфер обмена</p>}
        </>
      )}

      {tab === 'prompt' && <PromptGeneratorPanel />}
    </section>
  );
}
