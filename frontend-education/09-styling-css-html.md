# 09. HTML, JSX и CSS в проекте

В `VibeTest` UI описывается в TSX-файлах через JSX, а внешний вид задаётся обычными CSS-файлами.

## HTML vs JSX

JSX похож на HTML, но это синтаксис внутри TypeScript.

HTML:

```html
<button class="vt-btn" disabled>
  Далее
</button>
```

JSX:

```tsx
<button className="vt-btn" disabled={player.isChecking}>
  Далее
</button>
```

Разница:

- `className` вместо `class`;
- boolean/variables/functions передаются через `{}`;
- обработчики событий пишутся как `onClick={handler}`;
- некоторые имена свойств ближе к DOM API, а не HTML attributes.

## Почему `className`

В JavaScript `class` - ключевое слово. Поэтому React использует `className`, что соответствует DOM-свойству элемента.

Когда React создаёт DOM, `className="vt-btn"` становится обычным HTML class.

## Где лежат стили

Основные CSS-файлы:

- `../VibeTest/vibetest.client/src/index.css` - глобальная тема, reset, базовые элементы;
- `../VibeTest/vibetest.client/src/components/tests/tests.css` - тесты, editor, player;
- `../VibeTest/vibetest.client/src/guest/components/layout/GuestLayout.css` - guest layout;
- `../VibeTest/vibetest.client/src/full/components/layout/FullLayout.css` - full layout.

CSS импортируется из TS/TSX:

```tsx
import '@/components/tests/tests.css';
```

После импорта классы из CSS применяются глобально.

## Naming classes

В проекте видны группы классов:

- `.vt-*` - shared test UI;
- `.guest-*` - guest layout/pages;
- `.full-*` - full layout/pages.

Иногда используется BEM-подобный стиль:

```text
block__element--modifier
```

Пример по смыслу:

- `guest-nav`;
- `guest-nav__link`;
- `guest-nav__link--active`.

Это помогает понять структуру: block - компонент, element - часть компонента, modifier - состояние или вариант.

## Как связать JSX и CSS

Если видите:

```tsx
<button className="vt-btn vt-btn--ghost">
  Назад
</button>
```

Ищите в CSS:

```css
.vt-btn { ... }
.vt-btn--ghost { ... }
```

Элемент получает оба класса. Базовый класс задаёт общее оформление кнопки, modifier меняет вариант.

## Условные CSS-классы

В React классы можно собирать динамически:

```tsx
className={isActive ? 'guest-nav__link guest-nav__link--active' : 'guest-nav__link'}
```

В проекте это встречается в навигации и состояниях UI. Если класс зависит от state, ищите expression в `className={...}`.

## События в JSX

HTML:

```html
<button onclick="save()">Save</button>
```

React:

```tsx
<button type="button" onClick={handleSave}>
  Save
</button>
```

Не вызывайте функцию сразу:

```tsx
onClick={handleSave}    // правильно
onClick={handleSave()}  // почти всегда ошибка: вызовется во время render
```

Если нужно передать параметр:

```tsx
onClick={() => goToQuestion(order)}
```

## Forms

В React формы часто controlled: значение input хранится в state, а `onChange` обновляет state.

Упрощённо:

```tsx
const [name, setName] = useState('');

return (
  <input
    value={name}
    onChange={(event) => setName(event.target.value)}
  />
);
```

Это похоже на binding, но делается явно.

## Глобальный CSS

CSS в этом проекте глобальный. Это значит:

- класс `.vt-btn` доступен везде после импорта CSS;
- имена классов лучше делать уникальными по namespace;
- изменение общего класса может повлиять на много компонентов.

Поэтому не стоит переиспользовать слишком общие имена вроде `.button` или `.title`, если в проекте уже есть более конкретные naming conventions.

## Responsive UI

Responsive-правила обычно задаются через media queries:

```css
@media (max-width: 768px) {
  .some-layout {
    grid-template-columns: 1fr;
  }
}
```

Если UI ломается на мобильном размере, ищите `@media` в соответствующем CSS-файле.

## Практический алгоритм изменения внешнего вида

1. Найдите компонент по тексту на странице или route.
2. Найдите нужный JSX-элемент.
3. Посмотрите его `className`.
4. Найдите CSS-класс.
5. Проверьте, не используется ли этот класс в других местах.
6. Если изменение локальное, лучше добавить modifier class, чем ломать базовый класс.

## Частые ошибки

- Написать `class` вместо `className`.
- Забыть закрыть тег: `<input>` вместо `<input />`.
- Передать строку вместо expression: `disabled="false"` вместо `disabled={false}`.
- Случайно вызвать handler во время render: `onClick={save()}`.
- Изменить глобальный CSS-класс и задеть другие страницы.

