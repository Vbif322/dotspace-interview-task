# Сервис совместных холстов

Упрощённый бэкенд сервиса, в котором пользователи вместе рисуют на холстах: создают, меняют и удаляют фигуры. Сервис хранит историю изменений и умеет показать состояние холста на любой момент времени.

Стек: Node.js 22, TypeScript, Express 4, Sequelize 6, PostgreSQL 16, Zod 4.

## Задание (30 минут)

1. **Ревью** Прочитайте код модулей активации аккаунта и холстов. Найдите проблемы и расставьте их по критичности.
2. **Исправление** Исправьте две проблемы, которые считаете самыми критичными.
3. **Обсуждение** Расскажите, что исправили и почему именно так, и как бы проверили результат.

Пользоваться документацией и поиском можно. ИИ можно, но без отправки фрагментов кода.

## Запуск

```bash
docker compose up -d      # PostgreSQL 16 на порту 5433 со схемой и тестовыми данными
cp .env.example .env
npm ci
npm run dev               # http://localhost:3000
```

Проверка кода:

```bash
npm run lint
npm run build
```

Чтобы начать с чистой базой, выполните `docker compose down -v && docker compose up -d`.

## Структура

Поток запроса: роутер → контроллер → сервис → репозиторий → модель.

```
src/
  index.ts                 точка входа
  routers/                 маршруты
  controllers/             разбор и валидация запроса, ответ
  services/                бизнес-логика и транзакции
  repositories/            доступ к БД
  models/                  модели Sequelize
  middlewares/             авторизация, обработка ошибок
  scripts/db.script.ts     подключение к БД и managedTransaction
  utilities/               конфигурация, ошибки, время
db/init.sql                схема и тестовые данные
tools/                     вспомогательные скрипты
```

## Тестовые данные

| id  | Логин | Состояние                                         |
| --- | ----- | ------------------------------------------------- |
| 1   | alice | активирована; владелец холста 1                   |
| 2   | bob   | активирован; редактор холста 1, владелец холста 2 |
| 3   | carol | не активирована; токен активации `valid-token`    |
| 4   | dave  | не активирован; токен активации `stale-token`     |
| 5   | erin  | активирована; редактор холста 1                   |
| 6   | frank | активирован; наблюдатель холста 1                 |

- Холст 1 «Планирование спринта»: 1000 фигур `shape-0001` … `shape-1000`.
- Холст 2 «Бюджет отдела»: 3 фигуры, у alice доступа нет.

## API

Access-токен для пользователя из тестовых данных:

```bash
TOKEN=$(npm run -s token -- 1)
```

Активация аккаунта по токену из письма:

```bash
curl -X POST localhost:3000/api/auth/activate/valid-token
```

Участники холста:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "localhost:3000/api/canvas/participants?canvas_id=1&offset=0&limit=10"
```

Состояние фигур холста на момент времени (`shape_id` можно не указывать):

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "localhost:3000/api/canvas/shape/snapshot?canvas_id=1&shape_id=shape-0001&date=2030-01-01T00:00:00Z"
```

Пакетное изменение фигур (`add`, `update`, `delete`). Если действие не удалось, оно попадает в `failed`, а остальные действия пакета всё равно применяются:

```bash
curl -X POST localhost:3000/api/canvas/shape/actions \
  -H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d '{
    "canvas_id": 1,
    "actions": [
      { "operation": "update", "shape_id": "shape-0001", "content": { "type": "sticker", "text": "Готово" } },
      { "operation": "add", "shape_id": "shape-new", "content": { "type": "arrow" }, "rank": 1001 },
      { "operation": "delete", "shape_id": "shape-0002", "version": 1 }
    ]
  }'
```

Замер пакетного изменения (сервер должен быть запущен):

```bash
npm run bench:actions -- 10 100 500
```
