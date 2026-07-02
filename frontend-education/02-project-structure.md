# 02. Структура frontend-проекта

Фронтенд находится в `../VibeTest/vibetest.client`. Это отдельный Node/Vite-проект внутри общего решения VibeTest.

## Верхний уровень

```text
VibeTest/vibetest.client/
  index.html
  package.json
  vite.config.ts
  tsconfig*.json
  eslint.config.js
  .env.*
  public/
  scripts/
  e2e/
  src/
```

### `package.json`

Файл `../VibeTest/vibetest.client/package.json` отвечает за зависимости и команды.

Важные зависимости:

- `react` - компоненты и hooks;
- `react-dom` - подключение React к DOM браузера;
- `react-router-dom` - клиентские маршруты;
- `vite` - dev server и сборка;
- `typescript` - статическая типизация;
- `vite-plugin-pwa` - PWA для guest-режима;
- `@playwright/test` - e2e-тесты.

Важные scripts:

- `dev` - guest-режим;
- `dev:full` - full-режим с proxy на backend;
- `build` - production-сборка full;
- `build:guest` - production-сборка guest;
- `lint` - ESLint;
- `e2e:*` - Playwright.

### `index.html`

Это HTML-оболочка. В ней есть контейнер, куда React вставляет приложение:

```html
<div id="root"></div>
```

Также там подключается `src/main.tsx` как module script. Самих страниц в `index.html` нет.

### `vite.config.ts`

Файл `../VibeTest/vibetest.client/vite.config.ts` настраивает:

- React-плагин для Vite;
- alias `@` на папку `src`;
- guest/full поведение;
- HTTPS и proxy `/api` для full-режима;
- PWA только для guest-режима.

Для C# разработчика это ближе всего к смеси `Program.cs` для dev server и `.csproj`/publish-настроек для frontend.

### `.env.*`

Env-файлы задают значения, которые Vite подставляет при запуске или сборке. В клиентский код попадают только переменные с префиксом `VITE_`.

Пример смысловых переменных:

- `VITE_APP_MODE` - `guest` или `full`;
- `VITE_API_URL` - базовый URL API;
- `VITE_BASE_PATH` - base path для роутинга и ассетов.

Не стоит копировать значения из `.env` в документацию, особенно если там могут быть чувствительные данные.

## Папка `src`

`src` - основной код приложения.

```text
src/
  main.tsx
  App.tsx
  index.css
  config/
  types/
  utils/
  components/
  guest/
  full/
  pwa/
```

### `main.tsx`

Файл `../VibeTest/vibetest.client/src/main.tsx` - первая TypeScript-точка входа. Он импортирует глобальный CSS и монтирует `<App />` в DOM.

### `App.tsx`

Файл `../VibeTest/vibetest.client/src/App.tsx` выбирает, какое приложение показать:

- `GuestApp` для guest-режима;
- `FullApp` для full-режима.

### `config`

`../VibeTest/vibetest.client/src/config/env.ts` централизует доступ к env:

- `appMode`;
- `isGuestMode`;
- `isFullMode`;
- `basePath`;
- `apiUrl`.

Так код не читает `import.meta.env` в каждом компоненте.

### `types`

Здесь лежат TypeScript-типы: модели тестов, DTO API, payload-объекты. Это похоже на папку с contracts/DTO в backend-проекте.

### `utils`

Папка для функций без UI:

- `storage.ts` - `localStorage`;
- `authStorage.ts` - refresh token;
- `import.ts` - импорт JSON;
- `export.ts` - экспорт JSON;
- `validateTest.ts` - валидация тестов;
- `router.ts` - base path для React Router.

### `components`

Переиспользуемые компоненты, не привязанные строго к guest или full.

Самое важное:

- `components/tests/TestEditor.tsx`;
- `components/tests/TestPlayer.tsx`;
- `components/tests/player/*`;
- `components/pwa/PwaUpdatePrompt.tsx`;
- `components/info/PromptGeneratorPanel.tsx`.

### `guest`

Код guest-режима:

- `GuestApp.tsx` - маршруты;
- `pages` - страницы;
- `components/layout` - layout;
- `bootstrap/seedLocalTests.ts` - первичное заполнение demo-тестами;
- `data/seed` - JSON-банки вопросов.

Guest-режим работает без backend и хранит данные в браузере.

### `full`

Код full-режима:

- `FullApp.tsx` - маршруты;
- `pages` - страницы;
- `api` - typed API wrappers;
- `context/AuthContext.tsx` - auth state;
- `components/auth/ProtectedRoute.tsx` - защита страниц;
- `components/layout` - layout.

Full-режим общается с ASP.NET API.

## Alias `@`

В импортах часто встречается:

```ts
import { apiUrl } from '@/config/env';
```

`@` означает `src`. Это настроено в `vite.config.ts` и TypeScript config. Без alias импорт был бы вроде:

```ts
import { apiUrl } from '../../config/env';
```

Alias делает пути стабильнее при переносе файлов.

## Как искать нужный код

Практический подход:

- Нужно понять страницу по URL - начните с `GuestApp.tsx` или `FullApp.tsx`.
- Нужно понять UI-кнопку или форму - ищите компонент в `pages` или `components`.
- Нужно понять запрос к backend - смотрите `src/full/api`.
- Нужно понять локальные данные guest - смотрите `src/utils/storage.ts`.
- Нужно понять тип объекта - смотрите `src/types`.
- Нужно понять стиль элемента - возьмите `className` из TSX и найдите его в CSS.

