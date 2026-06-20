import { useState } from 'react';
import { isFullMode } from '@/config/env';
import { formatImportTestTemplate } from '@/utils/importTemplate';
import '@/guest/components/layout/GuestLayout.css';

const TEMPLATE_JSON = formatImportTestTemplate();

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

export function InfoPage() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await copyToClipboard(TEMPLATE_JSON);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <section className={isFullMode ? 'full-page' : 'guest-page'}>
      <h1>Формат JSON</h1>
      <p>
        Тест описывается объектом JSON. Поле <code>name</code> обязательно,{' '}
        <code>description</code> — опционально. Массив <code>questions</code> содержит вопросы с
        полем <code>text</code>; у каждого вопроса массив строк <code>answers</code> и число{' '}
        <code>correct</code> — индекс правильного ответа (с нуля).
      </p>

      <pre className="guest-code">{TEMPLATE_JSON}</pre>

      <p>
        <button type="button" className="guest-button" onClick={handleCopy}>
          Добавить в буфер обмена
        </button>
      </p>
      {copied && <p className="guest-success">Скопировано в буфер обмена</p>}
    </section>
  );
}
