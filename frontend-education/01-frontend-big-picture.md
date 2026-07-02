# 01. Общая картина фронтенда

Фронтенд `VibeTest` - это SPA: single-page application. Браузер получает один HTML-шаблон, загружает JavaScript bundle, а дальше React сам рисует страницы, переключает маршруты и реагирует на действия пользователя.

## Чем это отличается от привычного ASP.NET

В классическом server-rendered подходе:

```text
Browser -> ASP.NET endpoint -> HTML page -> Browser shows page
```

В этом проекте:

```text
Browser -> index.html + JS/CSS assets -> React app runs in browser
React app -> optional /api calls -> ASP.NET backend
```

ASP.NET backend в full-режиме остаётся важным: он хранит пользователей, тесты, заявки и результаты. Но UI не собирается Razor-страницами на сервере. UI собирает React в браузере.

## Основные технологии

### React

React - библиотека для построения UI из компонентов. Компонент - это функция, которая получает входные данные и возвращает JSX:

```tsx
function Greeting({ name }: { name: string }) {
  return <h1>Привет, {name}</h1>;
}
```

Для C# аналогия приблизительная: компонент похож на маленький View + ViewModel, только описанный функцией. Входные параметры называются `props`, внутренние изменяемые данные обычно хранятся через `useState`.

В проекте пример крупного компонента: `../VibeTest/vibetest.client/src/components/tests/TestPlayer.tsx`.

### TypeScript

TypeScript - это JavaScript со статическими типами. Он помогает IDE, ловит часть ошибок до запуска и делает контракты понятнее.

Важно: TypeScript-типы существуют на этапе разработки и сборки. В браузере исполняется обычный JavaScript.

В проекте типы домена лежат в:

- `../VibeTest/vibetest.client/src/types/index.ts`
- `../VibeTest/vibetest.client/src/types/api.ts`

Для C# разработчика это похоже на DTO и интерфейсы, но runtime-поведение другое: типы не проверяются автоматически после компиляции.

### JSX и TSX

`TSX` - TypeScript-файл, внутри которого можно писать JSX. JSX похож на HTML, но это не HTML-строка. Это синтаксис, который Vite/React превращает в JavaScript-вызовы.

Пример:

```tsx
return (
  <button type="button" onClick={handleClick}>
    Сохранить
  </button>
);
```

Главные отличия от HTML:

- `className` вместо `class`;
- обработчики событий пишутся как `onClick={...}`;
- значения вставляются через `{...}`;
- нужно закрывать теги: `<input />`, `<img />`.

### Vite

Vite - dev server и production bundler. В разработке он быстро отдаёт модули браузеру и обновляет страницу почти мгновенно. В production он собирает оптимизированные JS/CSS-файлы в `dist`.

Для .NET аналогия:

- `npm run dev` похож по роли на `dotnet watch`;
- `npm run build` похож по роли на publish frontend-части;
- `vite.config.ts` похож на конфигурацию dev server/build pipeline.

Конфигурация проекта: `../VibeTest/vibetest.client/vite.config.ts`.

### npm

`npm` решает две задачи:

- скачивает зависимости из `package.json` в `node_modules`;
- запускает scripts из `package.json`.

Главный файл: `../VibeTest/vibetest.client/package.json`.

Примеры:

```bash
npm run dev
npm run dev:full
npm run build
npm run lint
```

В C# мире ближайшие аналогии: NuGet для зависимостей и `dotnet` CLI/MSBuild для команд. Но npm scripts обычно более свободные: это просто именованные shell-команды.

### HTML

В этом проекте HTML почти весь описан внутри React-компонентов через JSX. Файл `../VibeTest/vibetest.client/index.html` - только оболочка, где есть элемент `root`.

React монтируется в этот элемент и дальше управляет содержимым страницы.

### CSS

CSS отвечает за внешний вид. В проекте используется обычный CSS:

- `../VibeTest/vibetest.client/src/index.css` - глобальные стили и тема;
- `../VibeTest/vibetest.client/src/components/tests/tests.css` - стили тестов;
- layout-стили лежат рядом с layout-компонентами.

Нет Tailwind, Sass, styled-components и UI-kit. Это облегчает чтение: видите `className="vt-btn"` в JSX, ищете `.vt-btn` в CSS.

## Два режима приложения

Ключевая особенность `VibeTest` - один frontend умеет работать в двух режимах:

- guest - локальный режим без backend, данные в `localStorage`;
- full - полноценный режим с API, JWT и пользователями.

Режим задаётся env-переменной `VITE_APP_MODE` и читается в `../VibeTest/vibetest.client/src/config/env.ts`.

Главный переключатель находится в `../VibeTest/vibetest.client/src/App.tsx`.

## Минимальная карта понятий

Если совсем коротко:

- `package.json` - что установлено и какие команды есть;
- `index.html` - куда React встраивает приложение;
- `main.tsx` - старт React;
- `App.tsx` - выбор guest/full;
- `GuestApp.tsx` и `FullApp.tsx` - маршруты;
- `pages` - экраны приложения;
- `components` - переиспользуемые куски UI;
- `utils` - функции без UI;
- `api` - HTTP-вызовы backend;
- `types` - TypeScript-контракты.

