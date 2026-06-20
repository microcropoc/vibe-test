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
| `GET` | `/api/tests?page=&pageSize=` | — | Список опубликованных тестов (пагинация) |
| `GET` | `/api/tests/{id}` | — | Детали теста для прохождения (без правильных ответов) |

---

## Тесты (авторизованный пользователь)

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| `GET` | `/api/tests/my?page=&pageSize=&filter=` | JWT | Мои тесты; `filter`: `all` \| `published` \| `private` |
| `GET` | `/api/tests/my/stats` | JWT | Статистика пользователя |
| `GET` | `/api/tests/{id}/full` | JWT | Полный тест владельца (с полем `correct`) |
| `POST` | `/api/tests` | JWT | Создать тест |
| `PATCH` | `/api/tests/{id}` | JWT | Дополнить тест новыми вопросами |
| `PATCH` | `/api/tests/{id}/info` | JWT | Изменить `name` / `description` |
| `POST` | `/api/tests/{id}/fork` | JWT | Копия своего теста |
| `PUT` | `/api/tests/{id}/publish` | JWT | Опубликовать |
| `PUT` | `/api/tests/{id}/unpublish` | JWT | Снять с публикации |
| `DELETE` | `/api/tests/{id}` | JWT | Удалить тест |

---

## Прохождение и результаты

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| `POST` | `/api/tests/{id}/submit` | JWT | Ответ на вопрос (`questionOrder`, `answerOrder`) |
| `GET` | `/api/tests/{id}/result` | JWT | Результат прохождения теста |
| `DELETE` | `/api/tests/{id}/result` | JWT | Удалить результат (пересдача) |
| `GET` | `/api/results?page=&pageSize=&sortBy=&order=` | JWT | История прохождений |

Параметры истории: `sortBy` — `date` (по умолчанию), `order` — `desc` \| `asc`.

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

- [§5 — бизнес-логика](spec.md#5-бизнес-логика) (иммутабельность, fork, дорешивание)
- [§6 — API с примерами тел](spec.md#6-api-эндпоинты)
- [§2 — схема БД](spec.md#2-структура-проекта)
