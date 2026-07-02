# 05. Роутинг и страницы

Во frontend роутинг работает в браузере. Пользователь видит URL вроде `/tests`, но при переходе React Router не обязательно запрашивает новую HTML-страницу с сервера. Он выбирает React-компонент, который нужно показать.

В проекте используется `react-router-dom`.

## Где описаны маршруты

Guest-режим:

- `../VibeTest/vibetest.client/src/guest/GuestApp.tsx`

Full-режим:

- `../VibeTest/vibetest.client/src/full/FullApp.tsx`

Оба файла используют:

```tsx
<BrowserRouter>
  <Routes>
    <Route ... />
  </Routes>
</BrowserRouter>
```

## Guest routes

В guest-режиме есть маршруты:

```text
/             -> HomePage
/tests        -> LocalTestsPage
/editor       -> EditorPage
/editor/:id   -> EditorPage
/play/:id     -> PlayPage
/import       -> ImportPage
/info         -> InfoPage
```

`:id` - параметр маршрута. Это похоже на route parameter в ASP.NET:

```csharp
[HttpGet("tests/{id}")]
```

Только здесь параметр читается в браузере через React Router hooks.

## Full routes

В full-режиме маршрутов больше:

```text
/                  -> HomePage
/login             -> LoginPage
/register          -> RegisterPage
/tests             -> PublicTestsPage
/tests/:id         -> TestPage
/tests/:id/play    -> ApiPlayPage
/application/:token -> ApplicationPlayPage
/play/:id          -> LocalPlayPage
/editor            -> EditorPage
/editor/:id        -> EditorPage
/import            -> ImportPage
/info              -> InfoPage
/my/tests          -> MyTestsPage
/profile           -> ProfilePage
/applications      -> ApplicationsPage
```

Некоторые guest-страницы переиспользуются в full-режиме: например editor/import/info и local play. Это нормально: full-режим расширяет возможности, но не выбрасывает локальные сценарии.

## Layout route

В обоих режимах есть route без path:

```tsx
<Route element={<GuestLayout />}>
  <Route index element={<HomePage />} />
  ...
</Route>
```

Это layout route. Layout рисует общую оболочку: header, nav, main area. Внутри layout обычно есть `<Outlet />`, куда React Router вставляет текущую страницу.

Аналогия из ASP.NET/Razor: `_Layout.cshtml` плюс `RenderBody()`.

## Index route

```tsx
<Route index element={<HomePage />} />
```

`index` означает страницу по базовому пути layout. Для guest это `/`, для full тоже `/`.

## Navigate

```tsx
<Route path="*" element={<Navigate to="/" replace />} />
```

`*` ловит неизвестные пути. `Navigate` делает redirect на `/`.

В full-режиме также есть redirect:

```tsx
<Route path="local/tests" element={<Navigate to="/my/tests" replace />} />
```

Это поддержка старого или альтернативного пути.

## Protected routes

В full-режиме часть маршрутов защищена:

```tsx
<Route element={<ProtectedRoute />}>
  <Route path="profile" element={<ProfilePage />} />
  <Route path="applications" element={<ApplicationsPage />} />
</Route>
```

`ProtectedRoute` проверяет auth state. Если пользователь не авторизован, его отправляют на login. Это похоже на `[Authorize]` в ASP.NET, но работает на клиенте.

Важно: frontend-защита нужна для UX, но backend всё равно обязан проверять авторизацию. Пользователь может вызвать API напрямую.

## Basename

Оба router используют:

```tsx
<BrowserRouter basename={routerBasename()}>
```

`basename` нужен, если приложение размещено не в корне домена, а в подпапке. Например GitHub Pages может отдавать сайт по `/vibe-test/`.

Связанные файлы:

- `../VibeTest/vibetest.client/src/utils/router.ts`;
- `../VibeTest/vibetest.client/src/config/env.ts`;
- env-переменная `VITE_BASE_PATH`.

## Page components

Папки `pages` содержат компоненты уровня страницы:

- guest pages: `../VibeTest/vibetest.client/src/guest/pages`;
- full pages: `../VibeTest/vibetest.client/src/full/pages`.

Страница обычно:

- читает route params;
- загружает данные;
- хранит loading/error state;
- собирает несколько UI-компонентов;
- вызывает API или storage functions.

Компоненты в `components` обычно более переиспользуемые и меньше знают про URL.

## Как проследить путь пользователя

Пример: пользователь открывает `/tests/123/play` в full-режиме.

1. `FullApp.tsx` находит route `tests/:id/play`.
2. React Router рендерит `PlayPage`.
3. `PlayPage` получает `id` из URL.
4. Страница создаёт source для `TestPlayer`.
5. `TestPlayer` вызывает `useTestPlayerController`.
6. Controller через source загружает тест из API.
7. Пользователь отвечает на вопросы, state меняется, UI перерисовывается.

## Что помнить

- React Router выбирает компоненты по URL на клиенте.
- Layout route - это общая оболочка страниц.
- Protected route - UX-защита, не замена backend authorization.
- `Navigate` - redirect.
- Route params похожи на route params в ASP.NET, но читаются в React-компоненте.

