# Справочник REST API

Базовый путь: `/api`. В full-режиме фронтенд обращается к `VITE_API_URL` (по умолчанию `/api`).

**Аутентификация:** для защищённых эндпоинтов заголовок `Authorization: Bearer <access_token>`.  
Access-токен обновляется через `POST /api/auth/refresh` с refresh-токеном.

Подробные DTO, бизнес-правила и примеры тел запросов — в [spec.md §6](spec.md#6-api-эндпоинты).

---

## Аутентификация

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| `POST` | `/api/auth/register` | — | Регистрация (`email`, `password`, `displayName`) → access + refresh |
| `POST` | `/api/auth/login` | — | Вход → access + refresh |
| `POST` | `/api/auth/refresh` | — | Обновление access по refresh-токену |
| `GET` | `/api/auth/me` | JWT | Текущий пользователь |

---

## Тесты (публичные)

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| `GET` | `/api/tests?page=&pageSize=&sortBy=&order=` | — | Список опубликованных тестов (пагинация) |
| `GET` | `/api/tests/{id}` | — | Детали теста для прохождения (без правильных ответов) |

---

## Тесты (авторизованный пользователь)

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| `GET` | `/api/tests/my?page=&pageSize=&filter=&sortBy=&order=` | JWT | Мои тесты; `filter`: `all` \| `published` \| `private` |
| `GET` | `/api/tests/my/stats` | JWT | Статистика пользователя: создано/опубликовано; прохождение своих (`totalPassedOwn`, `averageScoreOwn`) и чужих (`totalPassedOthers`, `averageScoreOthers`) тестов |
| `GET` | `/api/tests/{id}/full` | JWT | Полный тест владельца (с полем `correct`) |
| `POST` | `/api/tests` | JWT | Создать тест |
| `PATCH` | `/api/tests/{id}` | JWT | Дополнить тест новыми вопросами |
| `PATCH` | `/api/tests/{id}/info` | JWT | Изменить `name` / `description` |
| `PUT` | `/api/tests/{id}/publish` | JWT | Опубликовать |
| `PUT` | `/api/tests/{id}/unpublish` | JWT | Снять с публикации |
| `DELETE` | `/api/tests/{id}` | JWT | Удалить тест |

---

## Прохождение и результаты

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| `POST` | `/api/tests/{id}/submit` | JWT | Ответ на вопрос (`questionOrder`, `answerOrder`); в теле может быть `explanation`, если задано у вопроса |
| `GET` | `/api/tests/{id}/result` | JWT | Результат прохождения теста |
| `DELETE` | `/api/tests/{id}/result` | JWT | Удалить результат (пересдача) |
| `GET` | `/api/results?page=&pageSize=&sortBy=&order=` | JWT | История прохождений |

Параметры истории: `sortBy` — `date` (по умолчанию), `order` — `desc` \| `asc`.

Параметры списков тестов (`GET /api/tests`, `GET /api/tests/my`): `sortBy` — `updatedAt` (по умолчанию) \| `name`, `order` — `desc` (по умолчанию) \| `asc`. В элементах списка возвращается поле `updatedAt`.

---

## Заявки

Персональные ссылки на прохождение **непубличных** тестов без JWT у участника. Автор может предложить заявку зарегистрированному пользователю — она появится у него во входящих.

### Пользователи

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| `GET` | `/api/users/search?q=&limit=` | JWT | Поиск по `displayName` и `email` (contains, без учёта регистра). Минимум 2 символа в `q`, иначе 400. `limit` по умолчанию 10, макс. 20. Текущий пользователь исключается. В ответе: `id`, `displayName` (без email). |

### Заявки

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| `POST` | `/api/applications` | JWT | Создать заявку: `title`, `type` (`link` \| `internalUser`, по умолчанию `link`), `testId`, `hideResultsFromParticipant` (опционально), `recipientUserId` (обязателен при `type: internalUser`) |
| `GET` | `/api/applications?page=&pageSize=` | JWT | Список заявок автора с баллами и статусом |
| `GET` | `/api/applications/incoming?page=&pageSize=` | JWT | Входящие заявки для текущего пользователя (`recipientUserId`) |
| `GET` | `/api/applications/{token}` | — | Данные для прохождения: тест + `title`, `hideResultsFromParticipant`, `isCompleted`. Для `internalUser` — **403** без JWT назначенного пользователя |
| `POST` | `/api/applications/{token}/submit` | — | Ответ на вопрос (`questionOrder`, `selectedAnswerOrder`). Для `internalUser` — **403** без JWT назначенного пользователя |
| `GET` | `/api/applications/{token}/result` | — | Результат участника; **403**, если `hideResultsFromParticipant` или internal без JWT назначенного пользователя |

### Тела ответов (ключевые поля)

**`ApplicationResponse`** (создание): `id`, `token`, `title`, `type`, `testId`, `testName`, `hideResultsFromParticipant`, `playUrl` (пустая строка для `internalUser`), `createdAt`.

**`ApplicationListItem`** (список автора): поля `ApplicationResponse` плюс `isCompleted`, `correctAnswers`, `totalQuestions`, `scorePercent`, `recipientUserId` (для internal). `playUrl` — только для `link`.

**`IncomingApplicationListItem`** (входящие): `id`, `token`, `title`, `authorName`, `testId`, `testName`, `createdAt`, `isCompleted`, `hideResultsFromParticipant`, `playUrl`.

**`ApplicationPlayResponse`** (прохождение): поля теста как в `TestDetailResponse` (`id`, `name`, `description`, `authorName`, `questions`) плюс `title`, `hideResultsFromParticipant`, `isCompleted`.

**`SubmitResponse`** при скрытом результате: `correctAnswerOrder: -1`, `explanation: null`.

### Ошибки

| Ситуация | HTTP | Сообщение |
|----------|------|-----------|
| Заявка на публичный или чужой тест | 400 / 403 | Валидация / доступ |
| Пустое `title` | 400 | «Укажите название заявки» |
| `type: link` с `recipientUserId` | 400 | «Для заявки по ссылке нельзя указывать получателя» |
| `type: internalUser` без `recipientUserId` | 400 | «Укажите пользователя для внутренней заявки» |
| Предложение заявки самому себе | 400 | «Нельзя предложить заявку самому себе» |
| Прохождение internal без JWT / чужим пользователем | 403 | «Доступ к этой заявке только для назначенного пользователя» |
| Поиск пользователей с `q` короче 2 символов | 400 | «Укажите не менее 2 символов для поиска» |
| Submit после завершения заявки | 400 | «Тест по этой заявке уже пройден» |
| Результат при `hideResultsFromParticipant` | 403 | «Результат недоступен» |

Сценарии использования: [features.md § Заявки](features.md#заявки).

---

## Формат ошибок

Доменные исключения обрабатываются `DomainExceptionMiddleware` и возвращают JSON:

```json
{ "error": "Текст сообщения" }
```

| HTTP-код | Тип исключения | Типичные случаи |
|----------|----------------|-----------------|
| 400 | `ValidationException` | Невалидные данные, дедупликация вопросов |
| 401 | `UnauthorizedException` | Неверные учётные данные, просроченный токен |
| 403 | `ForbiddenException` | Нет прав на операцию |
| 404 | `NotFoundException` | Тест или результат не найден |
| 500 | прочие `DomainException` | Неожиданная доменная ошибка |

Стандартные ошибки ASP.NET (например, 401 без токена на `[Authorize]`) могут иметь другой формат тела.

---

## Связанные разделы spec.md

- [§5 — бизнес-логика](spec.md#5-бизнес-логика) (иммутабельность, обмен cloud ↔ local, дорешивание)
- [§6 — API с примерами тел](spec.md#6-api-эндпоинты)
- [§2 — схема БД](spec.md#2-структура-проекта)
