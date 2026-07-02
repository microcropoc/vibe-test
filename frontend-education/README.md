# Frontend Education для VibeTest

Эта папка - учебный маршрут по фронтенду проекта `VibeTest` для C# разработчика. Цель не в том, чтобы выучить весь React-экосистемный мир, а в том, чтобы уверенно читать и менять конкретный клиент `VibeTest/vibetest.client`.

Фронтенд здесь устроен достаточно дружелюбно для входа: React + TypeScript + Vite, без Redux, Tailwind, React Query и тяжёлых UI-фреймворков. Основные инструменты - компоненты, React hooks, React Router, обычный CSS, `localStorage` и небольшой API-клиент поверх `fetch`.

## Как читать

Рекомендуемый порядок:

1. `01-frontend-big-picture.md` - общая картина: что такое SPA, React, Vite, npm, TypeScript, HTML и CSS.
2. `02-project-structure.md` - где что лежит в `VibeTest/vibetest.client`.
3. `03-app-startup-and-modes.md` - как браузер запускает приложение и почему есть guest/full режимы.
4. `04-react-basics-in-this-project.md` - базовые React-понятия на примерах из проекта.
5. `05-routing-and-pages.md` - страницы, URL и layout через React Router.
6. `06-state-storage-and-data-flow.md` - состояние, `localStorage`, auth state и поток данных.
7. `07-api-auth-and-backend-integration.md` - full-режим, JWT, refresh token и связь с ASP.NET API.
8. `08-core-feature-walkthrough.md` - разбор ключевого функционала: тесты, редактор, импорт, прохождение.
9. `09-styling-css-html.md` - JSX как HTML, CSS-файлы и классы проекта.
10. `10-npm-vite-build-and-tests.md` - команды npm, Vite, сборка, lint, e2e.
11. `glossary.md` - словарь терминов с аналогиями из C#/.NET.

## Главная mental model

В ASP.NET MVC/Razor сервер обычно собирает HTML и отдаёт страницу. Здесь иначе: сервер отдаёт маленький HTML-файл, а всё UI-приложение дальше живёт в браузере.

```text
index.html
  -> src/main.tsx
    -> src/App.tsx
      -> GuestApp или FullApp
        -> React Router выбирает страницу
          -> страница собирает компоненты
            -> компоненты читают состояние и рисуют UI
```

В guest-режиме данные лежат в браузере в `localStorage`. В full-режиме приложение обращается к ASP.NET backend через `/api`, использует JWT и refresh token.

## Самые важные файлы

- `../VibeTest/vibetest.client/package.json` - зависимости и команды npm.
- `../VibeTest/vibetest.client/index.html` - HTML-точка входа.
- `../VibeTest/vibetest.client/src/main.tsx` - монтирует React в DOM.
- `../VibeTest/vibetest.client/src/App.tsx` - выбирает guest или full приложение.
- `../VibeTest/vibetest.client/src/config/env.ts` - читает режим и базовые настройки из env.
- `../VibeTest/vibetest.client/src/guest/GuestApp.tsx` - маршруты guest-режима.
- `../VibeTest/vibetest.client/src/full/FullApp.tsx` - маршруты full-режима.
- `../VibeTest/vibetest.client/src/full/context/AuthContext.tsx` - состояние авторизации.
- `../VibeTest/vibetest.client/src/full/api/client.ts` - общий HTTP-клиент.
- `../VibeTest/vibetest.client/src/utils/storage.ts` - работа с `localStorage`.
- `../VibeTest/vibetest.client/src/components/tests/TestPlayer.tsx` - общий компонент прохождения теста.

## Как запускать во время обучения

Из папки `VibeTest/vibetest.client`:

```bash
npm install
npm run dev
```

Это запустит guest-режим. Для full-режима с backend:

```bash
npm run dev:full
```

Если npm-зависимости уже установлены, `npm install` повторять не нужно.

## Что важно не путать

- `npm` - менеджер пакетов и запускатель scripts, не аналог NuGet один в один, но роль похожа.
- `Vite` - dev server и bundler, примерно как `dotnet watch` плюс часть publish-пайплайна для frontend.
- `React` - библиотека для UI-компонентов, не полноценный backend-фреймворк.
- `TypeScript` - JavaScript со статическими типами, но типы исчезают после сборки.
- `JSX` - синтаксис, похожий на HTML внутри TypeScript-файла.
- `CSS` - глобальные стили; в этом проекте без Tailwind и без CSS-in-JS.

