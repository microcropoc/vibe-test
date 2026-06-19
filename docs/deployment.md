# Деплой и CI

## Guest mode → GitHub Pages

Основной автоматический деплой — workflow [`.github/workflows/deploy-guest.yml`](../.github/workflows/deploy-guest.yml).

### Настройка репозитория

1. **Settings → Pages → Build and deployment**
2. **Source:** GitHub Actions (не «Deploy from a branch»)

### Как работает workflow

Триггеры: push в `main` / `master`, ручной запуск (`workflow_dispatch`).

1. `npm ci` и `npm run build:guest` в `VibeTest/vibetest.client`
2. `VITE_BASE_PATH=/${{ github.event.repository.name }}/` — для репозитория `vibe-test` это `/vibe-test/`
3. Артефакт `dist/` загружается и публикуется через `deploy-pages`

### Локальная проверка перед деплоем

```bash
cd VibeTest/vibetest.client
npm run build:guest
npm run preview:guest
```

Для имитации GitHub Pages задайте base path:

```bash
VITE_BASE_PATH=/vibe-test/ npm run build:guest
```

Файл [`.env.guest.production`](../VibeTest/vibetest.client/.env.guest.production):

```
VITE_APP_MODE=guest
VITE_BASE_PATH=/vibe-test/
```

Замените `/vibe-test/` на `/имя-вашего-репозитория/`, если имя отличается.

---

## Full mode (production)

### Ограничение текущего кода

Статика SPA из `dist/` отдаётся сервером **только в среде Development**:

```37:42:VibeTest/VibeTest.Server/WebApplicationExtensions.cs
        if (app.Environment.IsDevelopment())
        {
            app.UseDefaultFiles();
            app.MapStaticAssets();
            app.MapFallbackToFile("/index.html");
        }
```

В `Production` и `Staging` Kestrel обслуживает только API; отдельной раздачи `index.html` нет.

### Рекомендуемый путь для production

1. Собрать фронтенд:
   ```bash
   cd VibeTest/vibetest.client
   npm run build
   ```
2. Разместить содержимое `dist/` так, чтобы reverse proxy или веб-сервер отдавал SPA, а `/api` проксировал на Kestrel.
3. Задать `VITE_API_URL` при сборке, если API на другом origin (иначе по умолчанию `/api`).
4. **Обязательно сменить** в production:
   - `Jwt:Key` в конфигурации (минимум 32 символа)
   - `ConnectionStrings:DefaultConnection` — путь к SQLite или другая СУБД при миграции

Пример `appsettings.Production.json` (создаётся вручную на сервере):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=/var/lib/vibetest/vibetest.db"
  },
  "Jwt": {
    "Key": "<случайная-строка-32+-символов>"
  }
}
```

Запуск API:

```bash
cd VibeTest
ASPNETCORE_ENVIRONMENT=Production dotnet run --project VibeTest.Server
```

### Docker

В репозитории **нет** Dockerfile и docker-compose — готовых контейнерных инструкций нет.

---

## CI: E2E-тесты

Workflow [`.github/workflows/e2e.yml`](../.github/workflows/e2e.yml) на каждый push/PR в `main` / `master`:

1. Устанавливает .NET 10 и Node.js 22
2. `npm ci` + Playwright Chromium
3. `npm run e2e:guest` — guest E2E
4. `npm run e2e:full` — full E2E (API поднимается с `ASPNETCORE_ENVIRONMENT=E2E`)

При падении загружается артефакт `playwright-report` (хранение 7 дней).

Локальный запуск тех же тестов:

```bash
cd VibeTest/vibetest.client
npm run e2e:install    # один раз
npm run e2e:guest
npm run e2e:full
```

---

## Переменные окружения (сводка)

| Переменная | Где | Назначение |
|------------|-----|------------|
| `VITE_APP_MODE` | сборка SPA | `guest` / `full` |
| `VITE_BASE_PATH` | сборка SPA | базовый путь (GitHub Pages) |
| `VITE_API_URL` | сборка full SPA | URL API (по умолчанию `/api`) |
| `ASPNETCORE_ENVIRONMENT` | сервер | `Development`, `Production`, `E2E`, `Testing` |
| `ConnectionStrings:DefaultConnection` | appsettings | SQLite |
| `Jwt:*` | appsettings | ключ, issuer, сроки токенов |

Подробнее о разработке: [development.md](development.md)
