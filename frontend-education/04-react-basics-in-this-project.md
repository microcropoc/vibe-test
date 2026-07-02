# 04. React basics на примерах VibeTest

React в этом проекте используется без сложных state-management библиотек. Основные инструменты:

- функциональные компоненты;
- JSX/TSX;
- props;
- `useState`;
- `useEffect`;
- `useCallback`;
- `useMemo`;
- Context для авторизации.

## Компонент

Компонент - функция, которая возвращает UI.

Пример по смыслу:

```tsx
export function TestPlayer({ source, onExit }: TestPlayerProps) {
  const player = useTestPlayerController(source);

  if (player.phase === 'loading') {
    return <p className="vt-muted">Загрузка теста...</p>;
  }

  return <div className="vt-player">...</div>;
}
```

Реальный файл: `../VibeTest/vibetest.client/src/components/tests/TestPlayer.tsx`.

Для C# аналогия: это похоже на метод, который строит View на основе входных параметров и состояния. Но компонент может автоматически перерисоваться, когда меняется state.

## Props

Props - входные параметры компонента. Они передаются как HTML-атрибуты:

```tsx
<TestPlayer source={source} onExit={handleExit} />
```

В TypeScript props обычно типизированы:

```ts
type TestPlayerProps = {
  source: TestPlayerSource;
  onExit?: () => void;
};
```

В C# это похоже на параметры метода или public init-only свойства view model.

## JSX

JSX выглядит как HTML, но это JavaScript/TypeScript expression.

Пример:

```tsx
<button
  type="button"
  className="vt-btn"
  onClick={player.handleNext}
  disabled={!player.canGoNext || player.isChecking}
>
  Далее
</button>
```

Здесь:

- `className` задаёт CSS-класс;
- `onClick` получает функцию;
- `disabled` получает boolean expression;
- текст `Далее` будет виден пользователю.

## Условный рендеринг

React-компонент часто возвращает разный UI в зависимости от состояния.

В `TestPlayer` есть несколько ранних return:

- если загрузка упала с ошибкой - показать ошибку;
- если идёт загрузка - показать текст загрузки;
- если тест завершён - показать summary;
- если нет текущего вопроса - показать ошибку;
- иначе показать основной player.

Это похоже на guard clauses в C#:

```csharp
if (state.IsLoading) return LoadingView();
if (state.IsCompleted) return SummaryView();
return MainView();
```

## `useState`

`useState` хранит локальное состояние компонента.

Типичный frontend-паттерн:

```tsx
const [isLoading, setIsLoading] = useState(true);
```

`isLoading` - текущее значение. `setIsLoading` - функция изменения. После вызова setter React планирует повторный render компонента.

Важно: state нельзя менять напрямую как поле класса. Нужен setter.

## `useEffect`

`useEffect` запускает побочные эффекты: загрузку данных, подписки, синхронизацию с внешним API.

В `../VibeTest/vibetest.client/src/guest/GuestApp.tsx`:

```tsx
useEffect(() => {
  if (isGuestMode) {
    seedGuestTestsIfEmpty();
  }
}, []);
```

Пустой массив зависимостей `[]` означает: выполнить после первого render. Это похоже на `OnInitialized` в Blazor или lifecycle hook, но с React-правилами.

## `useCallback`

`useCallback` запоминает функцию между render-ами, пока не изменились зависимости.

В `AuthContext` это используется для `logout`, `refreshSession`, `login`, `register`. Это полезно, когда функция передаётся дальше в Context или effect dependencies.

Не нужно использовать `useCallback` везде. В проекте он применён там, где стабильность ссылки на функцию действительно помогает.

## `useMemo`

`useMemo` запоминает вычисленное значение.

В `AuthContext`:

```tsx
const value = useMemo<AuthContextValue>(
  () => ({
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    register,
    logout,
  }),
  [user, isLoading, login, register, logout],
);
```

Это значение отдаётся в `AuthContext.Provider`. Если не мемоизировать, объект создавался бы заново на каждый render.

## Context

Context - способ передать данные глубоко по дереву компонентов без ручной передачи props через каждый уровень.

В проекте основной Context - `../VibeTest/vibetest.client/src/full/context/AuthContext.tsx`.

Он хранит:

- `user`;
- `isAuthenticated`;
- `isLoading`;
- `login`;
- `register`;
- `logout`.

Для C# аналогия: не DI-контейнер в полном смысле, но похоже на scoped service для UI-дерева.

## Custom hook

Custom hook - функция, которая использует React hooks и инкапсулирует логику.

Пример: `useTestPlayerController` в `../VibeTest/vibetest.client/src/components/tests/player/useTestPlayerController.ts`.

`TestPlayer` остаётся больше про отображение, а controller hook содержит правила прохождения теста: загрузка вопросов, ответы, переходы, завершение, retry.

## Render - это не ручная перерисовка

В React вы не пишете: "найди кнопку и поменяй текст". Вы описываете, как UI должен выглядеть для текущего состояния.

```text
state changed -> React calls component again -> new JSX -> React updates DOM
```

Это важный сдвиг мышления после императивного UI.

## Практический способ читать компонент

1. Посмотрите props.
2. Найдите hooks в начале компонента.
3. Посмотрите ранние `return` для loading/error/empty states.
4. Найдите основной JSX.
5. По `onClick`, `onChange`, `onSubmit` перейдите к обработчикам.
6. По `className` найдите CSS.
7. По импортам определите, какие дочерние компоненты участвуют.

