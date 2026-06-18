import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/full/context/AuthContext';
import { ProtectedRoute } from '@/full/components/auth/ProtectedRoute';
import { FullLayout } from '@/full/components/layout/FullLayout';
import { HomePage } from '@/full/pages/HomePage';
import { LoginPage } from '@/full/pages/LoginPage';
import { MyTestsPage } from '@/full/pages/MyTestsPage';
import { ProfilePage } from '@/full/pages/ProfilePage';
import { PublicTestsPage } from '@/full/pages/PublicTestsPage';
import { RegisterPage } from '@/full/pages/RegisterPage';
import { TestPage } from '@/full/pages/TestPage';
import { EditorPage } from '@/guest/pages/EditorPage';
import { ImportPage } from '@/guest/pages/ImportPage';
import { routerBasename } from '@/utils/router';

export function FullApp() {
  return (
    <AuthProvider>
      <BrowserRouter basename={routerBasename()}>
        <Routes>
          <Route element={<FullLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="tests" element={<PublicTestsPage />} />
            <Route path="tests/:id" element={<TestPage />} />
            <Route path="editor" element={<EditorPage />} />
            <Route path="import" element={<ImportPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="my/tests" element={<MyTestsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
