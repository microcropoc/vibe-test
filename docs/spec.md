# VibeTest — Техническая спецификация

## 1. Описание проекта

**VibeTest** — конструктор тестов, работающий в браузере. Позволяет создавать, импортировать, проходить тесты и получать результаты. Регистрация добавляет облачное сохранение, публикацию и историю прохождений.

**Пользовательские сценарии**

Гость

· Просмотр списка публичных тестов с пагинацией
· Создание теста в редакторе → сохранение в localStorage
· Импорт теста из JSON (файл или буфер обмена)
· Прохождение локальных и импортированных тестов
· Просмотр результатов сразу после прохождения
· Экспорт теста в JSON (файл или буфер обмена)

Пользователь

Всё из гостевого доступа, плюс:

· Прохождение публичных тестов с сохранением результатов на сервере
· Сохранение тестов на сервер (изначально приватные)
· Публикация и скрытие тестов
· Дополнение тестов новыми вопросами (без удаления старых)
· Создание копии своего теста (fork)
· Изменение названия и описания теста
· Просмотр истории прохождений с баллами и датами
· Статистика: создано/опубликовано/пройдено/средний балл
· Дорешивание теста при добавлении новых вопросов
· Пересдача тестов (удаление старого результата)


**Стек технологий**:
- **Бэкенд**: ASP.NET Core 8, Entity Framework Core, SQLite
- **Фронтенд**: React 18, TypeScript, React Router
- **Аутентификация**: JWT (access + refresh токены)
- **Хранение на клиенте**: localStorage для гостевых тестов и прогресса

**Пользовательские роли**:
- **Гость** — создаёт локальные тесты в localStorage, проходит их, импортирует/экспортирует JSON
- **Пользователь** — всё из гостевого доступа + сохранение тестов на сервер, прохождение публичных тестов с сохранением результатов, статистика

---

## 2. Структура проекта

```
VibeTest/
├── VibeTest.sln
├── VibeTest.Api/                          # Единственный проект ASP.NET Core
│   ├── Controllers/
│   │   ├── AuthController.cs              # POST register/login/refresh, GET me
│   │   └── TestsController.cs            # CRUD тестов, submit, results
│   │
│   ├── Services/
│   │   ├── IAuthService.cs
│   │   ├── AuthService.cs                # Регистрация, логин, хеши, JWT
│   │   ├── ITestService.cs
│   │   ├── TestService.cs               # Бизнес-логика тестов
│   │   ├── IResultService.cs
│   │   ├── ResultService.cs             # Логика прохождения
│   │   ├── IUserService.cs
│   │   └── UserService.cs              # Статистика
│   │
│   ├── Data/
│   │   ├── AppDbContext.cs              # EF Core контекст
│   │   └── Migrations/                  # Авто-миграции
│   │
│   ├── Models/
│   │   ├── Entities/
│   │   │   ├── User.cs
│   │   │   ├── Test.cs
│   │   │   ├── Question.cs
│   │   │   ├── Answer.cs
│   │   │   ├── TestQuestionAnswer.cs
│   │   │   └── Result.cs
│   │   ├── Requests/
│   │   │   ├── RegisterRequest.cs
│   │   │   ├── LoginRequest.cs
│   │   │   ├── CreateTestRequest.cs
│   │   │   ├── AddQuestionsRequest.cs
│   │   │   ├── UpdateTestInfoRequest.cs
│   │   │   └── SubmitAnswerRequest.cs
│   │   └── Responses/
│   │       ├── AuthResponse.cs
│   │       ├── TestResponse.cs
│   │       ├── TestDetailResponse.cs
│   │       ├── TestFullResponse.cs
│   │       ├── TestResultResponse.cs
│   │       ├── SubmitResponse.cs
│   │       ├── UserStatsResponse.cs
│   │       └── PagedResponse.cs
│   │
│   ├── appsettings.json
│   ├── Program.cs                        # DI, JWT, CORS, middleware
│   └── VibeTest.Api.csproj
│
├── VibeTest.Api/ClientApp/               # React + TypeScript (стандартный шаблон VS)
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts                # Функции для вызова API (fetch-обёртки)
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── tests/
│   │   │   │   ├── TestList.tsx         # Список тестов с пагинацией
│   │   │   │   ├── TestCard.tsx         # Карточка теста
│   │   │   │   ├── TestPlayer.tsx       # Прохождение теста
│   │   │   │   ├── TestEditor.tsx       # Создание/редактирование
│   │   │   │   └── TestResult.tsx       # Результаты прохождения
│   │   │   ├── profile/
│   │   │   │   ├── ProfileStats.tsx
│   │   │   │   └── HistoryList.tsx
│   │   │   └── layout/
│   │   │       ├── Navbar.tsx
│   │   │       └── Layout.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx          # Контекст авторизации
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── PublicTestsPage.tsx
│   │   │   ├── TestPage.tsx
│   │   │   ├── EditorPage.tsx
│   │   │   ├── MyTestsPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── ImportPage.tsx
│   │   ├── types/
│   │   │   └── index.ts                # Все TypeScript-типы
│   │   ├── utils/
│   │   │   ├── storage.ts              # Работа с localStorage
│   │   │   ├── export.ts              # Экспорт теста в JSON
│   │   │   └── import.ts             # Импорт теста из JSON
│   │   ├── App.tsx                     # Роутинг
│   │   └── main.tsx                    # Входная точка
│   ├── package.json
│   └── tsconfig.json
│
└── VibeTest.Tests/                       # Тестовый проект
    ├── Integration/
    │   ├── TestServiceTests.cs
    │   ├── ResultServiceTests.cs
    │   └── AuthServiceTests.cs
    └── VibeTest.Tests.csproj
```

---

## 3. Структура базы данных

### SQL-запросы на создание таблиц

```sql
CREATE TABLE Users (
    Id INTEGER PRIMARY KEY,
    DisplayName TEXT NOT NULL,
    Email TEXT NOT NULL UNIQUE,
    PasswordHash TEXT NOT NULL,
    CreatedAt TEXT NOT NULL
);

CREATE TABLE Tests (
    Id INTEGER PRIMARY KEY,
    AuthorId TEXT NOT NULL,
    Name TEXT NOT NULL,
    Description TEXT,
    IsPublic INTEGER NOT NULL DEFAULT 0,
    CreatedAt TEXT NOT NULL,
    UpdatedAt TEXT NOT NULL,
    FOREIGN KEY (AuthorId) REFERENCES Users(Id) ON DELETE RESTRICT
);

CREATE TABLE Questions (
    Id INTEGER PRIMARY KEY,
    Text TEXT NOT NULL UNIQUE
);

CREATE TABLE Answers (
    Id INTEGER PRIMARY KEY,
    Text TEXT NOT NULL UNIQUE
);

CREATE TABLE TestQuestionAnswers (
    Id INTEGER PRIMARY KEY,
    TestId INTEGER NOT NULL,
    QuestionId INTEGER NOT NULL,
    AnswerId INTEGER NOT NULL,
    QuestionOrder INTEGER NOT NULL,
    AnswerOrder INTEGER NOT NULL,
    IsCorrect INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (TestId) REFERENCES Tests(Id) ON DELETE CASCADE,
    FOREIGN KEY (QuestionId) REFERENCES Questions(Id) ON DELETE RESTRICT,
    FOREIGN KEY (AnswerId) REFERENCES Answers(Id) ON DELETE RESTRICT,
    UNIQUE(TestId, QuestionOrder, AnswerOrder)
);

CREATE TABLE Results (
    Id INTEGER PRIMARY KEY,
    UserId INTEGER NOT NULL,
    TestId INTEGER NOT NULL,
    QuestionId INTEGER NOT NULL,
    AnswerId INTEGER NOT NULL,
    AnsweredAt TEXT NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (TestId) REFERENCES Tests(Id) ON DELETE CASCADE,
    FOREIGN KEY (QuestionId) REFERENCES Questions(Id) ON DELETE RESTRICT,
    FOREIGN KEY (AnswerId) REFERENCES Answers(Id) ON DELETE RESTRICT,
    UNIQUE(UserId, TestId, QuestionId)
);
```

## 4. Модели данных (C#)

```csharp
// User.cs
public class User
{
    public int Id { get; set; }
    public string DisplayName { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Test.cs
public class Test
{
    public int Id { get; set; }
    public int AuthorId { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public bool IsPublic { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public User Author { get; set; }
    public List<TestQuestionAnswer> QuestionAnswers { get; set; }
}

// Question.cs
public class Question
{
    public int Id { get; set; }
    public string Text { get; set; }
}

// Answer.cs
public class Answer
{
    public int Id { get; set; }
    public string Text { get; set; }
}

// TestQuestionAnswer.cs
public class TestQuestionAnswer
{
    public int Id { get; set; }
    public int TestId { get; set; }
    public int QuestionId { get; set; }
    public int AnswerId { get; set; }
    public int QuestionOrder { get; set; }
    public int AnswerOrder { get; set; }
    public bool IsCorrect { get; set; }
    
    public Test Test { get; set; }
    public Question Question { get; set; }
    public Answer Answer { get; set; }
}

// Result.cs
public class Result
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int TestId { get; set; }
    public int QuestionId { get; set; }
    public int AnswerId { get; set; }
    public DateTime AnsweredAt { get; set; }
    
    public User User { get; set; }
    public Test Test { get; set; }
    public Question Question { get; set; }
    public Answer Answer { get; set; }
}
```

---

## 5. Интерфейсы сервисов

```csharp
public interface ITestService
{
    // Публичные
    Task<PagedResponse<TestListItem>> GetPublicTests(int page, int pageSize);
    Task<TestDetailResponse> GetTestDetail(int testId);
    
    // Авторизованные — создание и редактирование
    Task<TestResponse> CreateTest(int authorId, CreateTestRequest request);
    Task<TestResponse> AppendQuestions(int testId, int authorId, AddQuestionsRequest request);
    Task<TestResponse> UpdateTestInfo(int testId, int authorId, UpdateTestInfoRequest request);
    Task<TestResponse> ForkTest(int testId, int authorId);
    Task PublishTest(int testId, int authorId);
    Task UnpublishTest(int testId, int authorId);
    Task DeleteTest(int testId, int authorId);
    
    // Авторизованные — свои тесты
    Task<PagedResponse<TestListItem>> GetMyTests(int authorId, int page, int pageSize, string filter);
    Task<TestFullResponse> GetTestFull(int testId, int authorId);
}

public interface IResultService
{
    Task<SubmitResponse> SubmitAnswer(int userId, int testId, SubmitAnswerRequest request);
    Task<TestResultResponse> GetResult(int userId, int testId);
    Task DeleteResult(int userId, int testId);
    Task<PagedResponse<TestHistoryItem>> GetUserResults(int userId, int page, int pageSize, string sortBy, string order);
}

public interface IUserService
{
    Task<UserStatsResponse> GetStats(int userId);
}
```

---

## 6. API-эндпоинты

### Публичные

**GET /api/tests?page=1&pageSize=10**

Возвращает список публичных тестов с пагинацией.

```json
{
  "items": [{
    "id": "int",
    "name": "SQL Basics",
    "description": "Test your SQL knowledge",
    "authorName": "Alice",
    "questionsCount": 10,
    "createdAt": "2024-01-15T10:30:00Z"
  }],
  "page": 1,
  "pageSize": 10,
  "totalCount": 42,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

**GET /api/tests/{id}**

Детальная информация о тесте (без правильных ответов).

```json
{
  "id": "int",
  "name": "SQL Basics",
  "description": "Test your SQL knowledge",
  "authorName": "Alice",
  "questions": [{
    "order": 0,
    "text": "What does SQL stand for?",
    "answers": [
      { "order": 0, "text": "Structured Query Language" },
      { "order": 1, "text": "Simple Query Logic" }
    ]
  }]
}
```

### Аутентификация

**POST /api/auth/register**

```json
// Request
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "Alice"
}

// Response
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresAt": "2024-01-15T10:45:00Z",
  "user": {
    "id": "int",
    "displayName": "Alice",
    "email": "user@example.com"
  }
}
```

**POST /api/auth/login** — аналогично register

**POST /api/auth/refresh**

```json
// Request
{ "refreshToken": "..." }

// Response
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresAt": "2024-01-15T10:45:00Z"
}
```

**GET /api/auth/me** — возвращает текущего пользователя

### Авторизованные (require JWT)

**POST /api/tests** — создать тест

```json
// Request
{
  "name": "SQL Fundamentals",
  "description": "Basic SQL concepts",
  "questions": [{
    "text": "What does SQL stand for?",
    "answers": [
      { "text": "Structured Query Language", "isCorrect": true },
      { "text": "Simple Query Logic", "isCorrect": false }
    ]
  }]
}

// Response
{
  "id": "int",
  "name": "SQL Fundamentals",
  "description": "Basic SQL concepts",
  "isPublic": false,
  "questionsCount": 1,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**PATCH /api/tests/{id}** — дополнить тест вопросами (request как у POST)

**PATCH /api/tests/{id}/info** — изменить название/описание

```json
{ "name": "New name", "description": "New description" }
```

**POST /api/tests/{id}/fork** — создать копию своего теста

**PUT /api/tests/{id}/publish** — опубликовать

**PUT /api/tests/{id}/unpublish** — скрыть

**DELETE /api/tests/{id}** — удалить

**GET /api/tests/my?page=1&pageSize=10&filter=all** — мои тесты (filter: all | published | private)

**GET /api/tests/my/stats** — статистика

```json
{
  "totalCreated": 5,
  "totalPublished": 3,
  "totalPassed": 12,
  "averageScore": 78.5
}
```

**GET /api/tests/{id}/full** — полная информация о своём тесте (с правильными ответами)

### Прохождение тестов

**POST /api/tests/{id}/submit** — ответить на вопрос

```json
// Request
{ "questionOrder": 0, "selectedAnswerOrder": 2 }

// Response
{ "correctAnswerOrder": 0 }
```

**GET /api/tests/{id}/result** — получить результат

```json
{
  "testId": 123,
  "testName": "SQL Basics",
  "totalQuestions": 10,
  "correctAnswers": 7,
  "incorrectAnswers": 3,
  "startedAt": "2024-01-15T10:35:00Z",
  "completedAt": "2024-01-15T10:35:00Z"
}
```

**DELETE /api/tests/{id}/result** — удалить результат (пересдача)

**GET /api/results?page=1&pageSize=20&sortBy=date&order=desc** — история прохождений

---

## 7. Бизнес-логика

### Иммутабельность

- Вопросы и ответы неизменяемы после создания
- Тест можно только дополнять новыми вопросами
- Нельзя изменить текст вопроса, ответа или правильность ответа
- Нельзя удалить вопрос из теста

### Дедупликация

При создании вопроса или ответа:
1. Поиск по точному совпадению `Text`
2. Если найден — используется существующий Id
3. Если нет — создаётся новый

### Дополнение теста

- Только автор может дополнять тест
- Новые вопросы получают следующие порядковые номера (`MAX(QuestionOrder) + 1`)
- Существующие вопросы не затрагиваются
- Результаты пользователей сохраняются — пользователь может дорешать новые вопросы

### Fork

- Только автор оригинала может создать копию
- Новый тест полностью независим
- Копируются все вопросы и ответы через `TestQuestionAnswers`
- Результаты не копируются

### Прохождение теста

1. Клиент получает тест через `GET /api/tests/{id}`
2. Пользователь выбирает ответ на вопрос
3. `POST /api/tests/{id}/submit` — сервер находит правильный ответ через TQA, сохраняет Result
4. Ответ: `correctAnswerOrder`
5. Клиент сравнивает, показывает результат
6. Можно отвечать в любом порядке, переотвечивать
7. `GET /api/tests/{id}/result` — полная статистика

### JWT-аутентификация

- Access token: 15 минут, хранится в памяти
- Refresh token: 7 дней, localStorage, ротация при обновлении
- При 401 → POST /auth/refresh → повтор запроса
- При ошибке обновления → выход

---

## 8. UI/UX

### Страницы

**Гость:**
- **Публичные тесты** — список с пагинацией, просмотр теста
- **Редактор** — создание теста с сохранением в localStorage или экспорт в JSON
- **Импорт** — загрузка JSON из файла или вставка из буфера обмена
- **Локальные тесты** — список тестов из localStorage, прохождение, удаление
- **Вход/Регистрация** — формы с валидацией

**Пользователь (дополнительно):**
- **Профиль** — статистика, история прохождений, мои тесты
- В публичных тестах: кнопка «Пройти» с сохранением результатов на сервер
- Индикатор новых вопросов в тестах, которые нужно дорешать

### Прохождение теста (TestPlayer)

**Состояния компонента:**
- `loading` — загрузка вопроса
- `answering` — выбор варианта ответа (radio buttons)
- `checking` — отправка ответа на сервер
- `result` — показ правильного/неправильного ответа с подсветкой
- `completed` — итоговый результат (score, percentage)
- `unresolved` — есть новые вопросы для дорешивания

**Навигация:**
- Один вопрос на экране
- Индикация вопросов: не отвечен / отвечен правильно / неправильно
- Кнопка «Проверить» → отправка ответа → подсветка
- Кнопка «Далее» → следующий вопрос
- Можно вернуться к предыдущим (результаты сохранены)
- После последнего вопроса → итоговый результат

### Редактор теста (TestEditor)

**Состояния:** `editing` → `preview` → `saving`

**Функции:**
- Добавление/редактирование вопросов и ответов (до сохранения)
- Отметка правильного ответа (ровно один на вопрос)
- Предпросмотр как пользователь
- Сохранение в localStorage или экспорт в JSON (гость)
- Сохранение на сервер (пользователь)

### Восстановление прогресса

- **Пользователь**: при входе `GET /result` → подсветить отвеченные вопросы
- **Гость**: localStorage хранит прогресс и ответы
- При перезагрузке страницы восстанавливается последнее состояние

### Хранение на клиенте (localStorage-ключи)

| Ключ | Содержимое |
|------|------------|
| `vibetest_local_tests` | Массив локальных тестов |
| `vibetest_progress_{id}` | Прогресс прохождения теста |
| `vibetest_guest_results` | Результаты гостя |
| `vibetest_refresh_token` | JWT refresh token |

### JSON-формат для импорта/экспорта

```json
{
  "name": "SQL Basics",
  "description": "Test your knowledge",
  "questions": [{
    "text": "What does SQL stand for?",
    "answers": [
      { "text": "Structured Query Language", "isCorrect": true },
      { "text": "Simple Query Logic", "isCorrect": false }
    ]
  }]
}
```

**Валидация импорта:**
- `name` непустое
- Минимум 1 вопрос
- Минимум 2 ответа на вопрос
- Ровно 1 правильный ответ на вопрос

---

## 9. Этапы разработки

**Этап 1 — Сервисы и БД (текущий)**
- Модели, DbContext, миграции
- Репозитории
- Сервисы
- Интеграционные тесты (SQLite in-memory)
- Без Web, без JWT, без контроллеров

**Этап 2 — API**
- Контроллеры
- JWT-аутентификация
- Валидация запросов
- Интеграционные тесты API

**Этап 3 — Фронтенд-ядро**
- TypeScript-типы
- API-клиент
- Утилиты (storage, export, import)
- AuthContext, роутинг

**Этап 4 — Фронтенд-UI**
- Страницы и компоненты
- TestPlayer, TestEditor
- Пагинация, восстановление прогресса
- Импорт/экспорт

**Этап 5 — E2E-тесты**
- Playwright
- Основные пользовательские сценарии