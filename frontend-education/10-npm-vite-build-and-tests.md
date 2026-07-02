# 10. npm, Vite, build и тесты

Все frontend-команды запускаются из папки:

```bash
cd VibeTest/vibetest.client
```

Главный файл команд: `../VibeTest/vibetest.client/package.json`.

## Первичная установка

```bash
npm install
```

Команда читает `package.json` и lock-файл, затем скачивает зависимости в `node_modules`.

`node_modules` обычно не коммитят. Это аналог локального package cache/dependencies folder для Node-проектов.

## Scripts

В `package.json` есть секция `scripts`:

```json
"scripts": {
  "dev": "vite --mode guest",
  "dev:full": "vite --mode full",
  "build": "tsc -b && vite build --mode full",
  "build:guest": "tsc -b && vite build --mode guest",
  "lint": "eslint ."
}
```

Запуск:

```bash
npm run dev
```

`npm run <name>` выполняет script с этим именем.

## `npm run dev`

Guest dev server:

```bash
npm run dev
```

Что делает:

- запускает Vite;
- использует mode `guest`;
- по умолчанию работает на `http://localhost:5173`;
- не требует backend;
- данные хранятся в `localStorage`.

Используйте эту команду, если изучаете frontend UI, редактор, импорт, локальное прохождение тестов.

## `npm run dev:full`

Full dev server:

```bash
npm run dev:full
```

Что делает:

- запускает Vite в mode `full`;
- включает HTTPS dev server;
- использует port `64028`, если не переопределён;
- проксирует `/api` на ASP.NET backend;
- включает auth/API сценарии.

Для полноценной работы должен быть запущен backend.

## `npm run build`

Production-сборка full-режима:

```bash
npm run build
```

Выполняет:

```text
tsc -b
vite build --mode full
```

`tsc -b` проверяет TypeScript. `vite build` собирает production bundle.

## `npm run build:guest`

Production-сборка guest-режима:

```bash
npm run build:guest
```

Используется для статического guest-деплоя. В guest production может быть включён PWA-плагин.

## `npm run preview`

Preview запускает локальный сервер для уже собранного `dist`.

```bash
npm run preview
```

Это не то же самое, что `dev`. Preview ближе к проверке production build.

## `npm run lint`

```bash
npm run lint
```

ESLint проверяет код на типичные ошибки и style issues. Это не компилятор TypeScript, а отдельный анализатор.

Для C# аналогия: часть правил похожа на Roslyn analyzers, но для JS/TS/React.

## E2E Playwright

Команды:

```bash
npm run e2e:install
npm run e2e:guest
npm run e2e:full
npm run e2e
```

`e2e:install` ставит Chromium для Playwright.

`e2e:guest` проверяет guest-сценарии.

`e2e:full` проверяет full-сценарии с backend окружением E2E.

Конфиги:

- `../VibeTest/vibetest.client/playwright.guest.config.ts`;
- `../VibeTest/vibetest.client/playwright.full.config.ts`.

## Vite mode

`--mode guest` и `--mode full` говорят Vite, какие env-файлы читать и какие значения использовать.

В коде это превращается в:

```ts
import.meta.env.VITE_APP_MODE
```

А затем в `src/config/env.ts`:

```ts
export const isGuestMode = appMode === 'guest';
```

## Dev proxy

В full-режиме frontend может вызвать:

```text
/api/tests
```

Vite proxy перешлёт запрос на ASP.NET backend. Это удобно, потому что:

- frontend-код не хранит полный backend URL в каждом запросе;
- меньше проблем с CORS в локальной разработке;
- браузер видит запрос как same-origin к dev server.

## PWA

PWA включается только для guest-режима и не включается для E2E guest mode.

Настройка в `vite.config.ts`:

- manifest;
- icons;
- service worker caching через Workbox;
- fallback на `index.html`.

Если вы не занимаетесь offline/deploy частью, PWA можно сначала пропустить.

## Частые проблемы запуска

### `npm` не найден

Нужно установить Node.js. npm идёт вместе с Node.

### Ошибки после обновления зависимостей

Попробуйте:

```bash
npm install
```

Не удаляйте lock-файл без причины.

### API не отвечает в full-режиме

Проверьте:

- запущен ли backend;
- правильный ли HTTPS port;
- работает ли `/api` proxy;
- не запущен ли guest-режим вместо full.

### Страница работает в dev, но ломается после deploy

Проверьте:

- `VITE_BASE_PATH`;
- `routerBasename()`;
- production build mode;
- пути к static assets.

## Минимальные команды для повседневной работы

```bash
cd VibeTest/vibetest.client
npm run dev
npm run lint
npm run build
```

Для full-сценариев:

```bash
npm run dev:full
```

