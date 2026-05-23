# ERRORS

Задокументированные ошибки, их причины и решения.

---

## TypeORM migration: column "camelCaseColumn" does not exist

**Ошибка:**
```
QueryFailedError: column "recieverId" does not exist
```

**Причина:**
Проект использует `SnakeNamingStrategy` из `typeorm-naming-strategies` (см. `packages/backend/src/app/database/database.module.ts`). TypeORM автоматически преобразует все имена столбцов в snake_case при работе через ORM. Однако в миграциях SQL пишется вручную — и если в запросе указать camelCase-имя (`"recieverId"`, `"createdAt"`), PostgreSQL не найдёт такой столбец.

**Решение:**
В SQL-запросах внутри миграций всегда использовать snake_case:

| camelCase (TypeScript) | snake_case (SQL в миграции) |
|---|---|
| `recieverId` | `reciever_id` |
| `senderId` | `sender_id` |
| `anonymousSenderId` | `anonymous_sender_id` |
| `createdAt` | `created_at` |
| `recieverReadAt` | `reciever_read_at` |
| `anonymousNumber` | `anonymous_number` |

**Правило:** при написании любого SQL в миграциях — имена столбцов всегда в snake_case, даже если в сущности поле называется в camelCase.
