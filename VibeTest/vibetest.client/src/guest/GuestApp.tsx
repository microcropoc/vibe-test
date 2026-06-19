import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { GuestLayout } from '@/guest/components/layout/GuestLayout';
import { EditorPage } from '@/guest/pages/EditorPage';
import { HomePage } from '@/guest/pages/HomePage';
import { ImportPage } from '@/guest/pages/ImportPage';
import { LocalTestsPage } from '@/guest/pages/LocalTestsPage';
import { PlayPage } from '@/guest/pages/PlayPage';
import { routerBasename } from '@/utils/router';

export function GuestApp() {
  return (
    <BrowserRouter basename={routerBasename()}>
      <Routes>
        <Route element={<GuestLayout />}>
          <Route index element={<HomePage />} />
          <Route path="tests" element={<LocalTestsPage />} />
          <Route path="editor" element={<EditorPage />} />
          <Route path="editor/:id" element={<EditorPage />} />
          <Route path="play/:id" element={<PlayPage />} />
          <Route path="import" element={<ImportPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
