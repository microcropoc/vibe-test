# Glossary: frontend термины для C# разработчика

Краткий словарь терминов, которые встречаются во frontend-части `VibeTest`.

## SPA

Single-page application. Приложение получает один HTML shell, а страницы переключаются в браузере без полной перезагрузки.

Аналогия: ближе к desktop/mobile client, который общается с Web API, чем к server-rendered MVC.

## React

Библиотека для UI-компонентов. В проекте React отвечает за отрисовку страниц, обработку событий и обновление DOM при изменении state.

Аналогия: слой View/ViewModel, но написанный функциональными компонентами.

## Component

Функция, возвращающая JSX.

Аналогия: маленькая view с входными параметрами и внутренним состоянием.

## Props

Входные параметры компонента.

Аналогия: параметры метода, constructor args или public properties view model.

## State

Данные, изменение которых приводит к повторному render компонента.

Аналогия: private fields + notification, но через React `useState`.

## Hook

Функция React для работы со state, lifecycle и другой React-механикой. Примеры: `useState`, `useEffect`, `useMemo`.

Custom hook - ваша функция, которая использует hooks и инкапсулирует UI-логику.

## `useState`

Хранит локальное состояние компонента.

```tsx
const [value, setValue] = useState('');
```

## `useEffect`

Запускает side effects после render: загрузку данных, подписки, синхронизацию.

Аналогия: lifecycle hook, но с dependency array.

## `useCallback`

Мемоизирует функцию, чтобы ссылка на неё не менялась без необходимости.

## `useMemo`

Мемоизирует вычисленное значение.

## Context

Способ передать значение глубоко по дереву компонентов без проброса props через каждый уровень.

Аналогия: scoped shared UI service. В проекте используется для auth state.

## JSX

HTML-похожий синтаксис внутри TypeScript/JavaScript.

Пример:

```tsx
<button onClick={save}>Save</button>
```

## TSX

TypeScript-файл, в котором разрешён JSX.

## DOM

Document Object Model. Объектное представление HTML-страницы в браузере.

React обновляет DOM на основе результата render.

## Render

Вызов компонента для получения JSX. Render не должен иметь опасных side effects.

## Re-render

Повторный render после изменения state, props или context.

## Virtual DOM

Внутреннее представление UI, которое React использует, чтобы понять, как минимально обновить настоящий DOM. В повседневной работе чаще важнее думать про state -> render.

## React Router

Библиотека клиентской маршрутизации. Выбирает React-компонент по URL.

Аналогия: routing в ASP.NET, но выполняется в браузере.

## Route

Связка path -> component.

Пример: `/tests/:id` -> `TestPage`.

## Layout route

Маршрут-обёртка для общей структуры страницы. Обычно содержит header/nav и `<Outlet />`.

Аналогия: `_Layout.cshtml` + `RenderBody()`.

## `localStorage`

Key-value хранилище браузера. Данные сохраняются между refresh, но локальны для браузера и origin.

Аналогия: маленькое локальное хранилище клиента, не база данных backend.

## `fetch`

Browser API для HTTP-запросов.

Аналогия: `HttpClient`, но в браузере.

## DTO

Data Transfer Object. В frontend это TypeScript type/interface для request/response.

Важно: TypeScript type сам по себе не валидирует JSON в runtime.

## npm

Node package manager. Ставит зависимости и запускает scripts.

Аналогия: частично NuGet, частично `dotnet` CLI/MSBuild scripts.

## `package.json`

Файл зависимостей и команд Node-проекта.

Аналогия: смесь `.csproj`, `Directory.Packages.props` и списка CLI scripts.

## `node_modules`

Папка установленных npm-зависимостей. Обычно не коммитится.

## Vite

Dev server и bundler. Запускает frontend в development и собирает production bundle.

Аналогия: `dotnet watch` + frontend publish pipeline.

## Bundle

Собранные JS/CSS/assets для браузера.

## Env variables в Vite

Переменные с префиксом `VITE_`, доступные frontend-коду через `import.meta.env`.

Не храните секреты во frontend env.

## HMR

Hot Module Replacement. Обновление модулей в браузере без полной перезагрузки страницы во время разработки.

## CSS

Язык стилей. В проекте используется plain CSS.

## `className`

React/JSX-атрибут для CSS-класса. В HTML это станет `class`.

## PWA

Progressive Web App. Возможность сделать web-приложение похожим на устанавливаемое/offline-приложение. В проекте используется для guest-режима.

## Playwright

E2E testing framework. Запускает браузер и проверяет пользовательские сценарии.

Аналогия: UI/integration tests с настоящим браузером.

## ESLint

Линтер для JS/TS/React. Находит ошибки и нарушения правил.

Аналогия: Roslyn analyzers для frontend-кода.

## Alias `@`

Короткий путь к `src`.

```ts
import { apiUrl } from '@/config/env';
```

То же по смыслу, что импорт из `src/config/env`.

## Guest mode

Режим без backend API. Данные хранятся в `localStorage`, доступны demo-тесты, возможна static/PWA-сборка.

## Full mode

Режим с backend API, пользователями, JWT auth, заявками и cloud-тестами.

