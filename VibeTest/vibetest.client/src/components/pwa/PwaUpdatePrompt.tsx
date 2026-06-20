import { useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import '@/components/tests/tests.css';
import './pwa-update-prompt.css';

export function PwaUpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const updateSW = useRef<((reloadPage?: boolean) => Promise<void>) | undefined>(undefined);

  useEffect(() => {
    updateSW.current = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
    });
  }, []);

  if (!needRefresh) {
    return null;
  }

  return (
    <div className="pwa-update" role="status" aria-live="polite">
      <span className="pwa-update__text">Доступна новая версия</span>
      <button type="button" className="vt-btn" onClick={() => void updateSW.current?.(true)}>
        Обновить
      </button>
    </div>
  );
}
