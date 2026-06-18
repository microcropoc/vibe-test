import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { basePath } from '@/config/env';
import { GuestLayout } from '@/guest/components/layout/GuestLayout';
import { EditorPage } from '@/guest/pages/EditorPage';
import { HomePage } from '@/guest/pages/HomePage';
import { ImportPage } from '@/guest/pages/ImportPage';
import { LocalTestsPage } from '@/guest/pages/LocalTestsPage';

export function GuestApp() {
  return (
    <BrowserRouter basename={basePath === '/' ? undefined : basePath.replace(/\/$/, '')}>
      <Routes>
        <Route element={<GuestLayout />}>
          <Route index element={<HomePage />} />
          <Route path="tests" element={<LocalTestsPage />} />
          <Route path="editor" element={<EditorPage />} />
          <Route path="import" element={<ImportPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
