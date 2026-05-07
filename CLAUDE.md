# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Запуск и разработка

Все сервисы запускаются через Docker Compose. Прямой запуск через npm не используется для разработки.

```bash
# Скопировать конфиг backend и заполнить поля
cp packages/backend/config.example.yaml packages/backend/config.yaml

# Опционально: переопределить порты и настройки
cp .env.example .env

# Запустить весь стек
docker compose up

# Запустить отдельные сервисы
docker compose up database backend
docker compose up database backend web
```

После запуска изменения в коде подхватываются автоматически (hot reload).

## Ключевые команды

```bash
# Сборка
npm run build                    # сборка всех пакетов
npm run build-shared             # только shared (нужно перед build:backend/web)

# Линтинг
npm run lint

# Тесты (Jest)
npm test
cd packages/backend && npm test  # тесты только backend
cd packages/backend && npx jest path/to/file.spec.ts  # один файл

# TypeORM миграции (через docker или локально)
cd packages/backend && npm run typeorm -- migration:run
cd packages/backend && npm run typeorm -- migration:generate src/app/migrations/MigrationName
```

## Порты по умолчанию (из .env.example)

| Сервис | Порт |
|---|---|
| Backend API | 4444 |
| Backend debug (inspect) | 9244 |
| Web (Next.js) | 80 |
| PostgreSQL | 5432 |

## Структура монорепозитория

```
packages/
  backend/   — NestJS API сервер
  web/       — Next.js веб-приложение
  frontend/  — React Native / Expo мобильное приложение (в docker-compose закомментирован)
  shared/    — общие типы, API-интерфейсы и роуты (импортируется как @paulislava/shared)
  database/  — SQL-скрипты для инициализации PostgreSQL
  webdav/    — WebDAV сервер (данные)
```

## Архитектура

### Контракт между backend и frontend — пакет `shared`

Взаимодействие между сервисами описывается в `packages/shared`. Паттерн: интерфейс сервиса + `APIRoutes` + `apiInfo`.

```ts
// shared определяет интерфейс и роуты
export interface CarAPI { getInfo(id: number): Promise<CarInfo> }
const CAR_API = apiInfo({ getInfo: (id) => `${id}` }, 'car');

// backend реализует интерфейс в контроллере
// web/frontend реализует через сервис с fetch/axios
```

`apiInfo()` из `shared/src/api-routes.ts` генерирует типизированные пути для обеих сторон. Backend использует `backendRoutes`, frontend — `simpleRoutes` / `fullRoutes`.

### Backend (NestJS)

- Конфигурация загружается из `config.yaml` (не из env) через `packages/backend/src/app/config/`; схема и валидация — `config.schema.ts`
- Auth: JWT в httpOnly cookie (`auth`), анонимный идентификатор в cookie `anonymous_id`
- Режимы аутентификации: `tel` (SMS) и `email` — определяется в `config.yaml` полем `auth.mode`
- TypeORM с PostgreSQL; сущности в `src/app/entities/`, миграции в `src/app/migrations/`
- `TelegramService` запускается условно: при `DISABLE_TELEGRAM=1` (env) модуль не инициализирует Telegraf. Ошибки polling (409 Conflict) перехватываются через патч `startPolling` и переводят сервис в режим `available=false` без краша процесса

### Web (Next.js App Router)

- Роуты в `packages/web/src/app/` — стандартная структура App Router
- API-запросы к backend проксируются через Next.js: `BACKEND_URL` + `ROUTE_PREFIX` из env

### shared — типы и APIRoutes

- `src/api-routes.ts` — утилита `apiInfo()`, тип `APIRoutes<T>`
- Поддиректории по доменам: `auth/`, `car/`, `chat/`, `user/`, `file/`, `payment/`
- После изменений нужен `npm run build-shared` перед пересборкой backend/web

## Именование файлов

- Файлы — `kebab-case`
- Тип файла указывается в имени через точку: `user.service.ts`, `car.controller.ts`, `car.entity.ts`, `auth.dto.ts`
- Компоненты React — `PascalCase` в имени файла и экспорте
- Не использовать `index.ts` как имя файла

## Ветки (GitLab Flow)

| Ветка | Назначение |
|---|---|
| `release` | production |
| `master` | текущая разработка, всегда собирается |
| `feature/<desc>[-id]` | новые задачи → в master через MR |
| `bugfix/<desc>[-id]` | несрочные исправления |
| `hotfix/<desc>[-id]` | срочные → сразу в release + master |
| `epic/<name>` | крупные задачи из нескольких feature-веток |
| `refactor/<desc>` | рефакторинг |

Имена веток в kebab-case.

## CI/CD

GitHub Actions (`.github/workflows/dev.yml`) — self-hosted runner на сервере:
1. `build-backend` — `docker build --target backend`, затем `docker run --name beznomera_backend ...`
2. `build-web` — `docker build --target web`, затем `docker run --name beznomera_web ...`
3. `clean` — `docker system prune -f`

Конфигурация backend на сервере: `/home/user/web/beznomera.net/config-backend.yaml` и `/home/user/web/beznomera.net/web.env`.

## Сервер

При упоминании "на сервере" — подключаться по SSH: `root@beznomera.net`.
