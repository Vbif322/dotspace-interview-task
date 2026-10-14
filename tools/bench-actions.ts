/**
 * Замер пакетного изменения фигур. Сервер должен быть запущен.
 * Использование: npm run bench:actions -- 10 500 1000
 */
import { GLOBAL_DB_MANAGER } from '#scripts/db.script.js';
import { CONFIG } from '#utilities/config.js';

import { RepoUser } from '#repositories/auth/user.repository.js';
import { ServiceToken } from '#services/auth/token.service.js';

const CANVAS_ID = 1;
const SHAPES_IN_SEED = 1000;
const URL = `http://localhost:${CONFIG.PORT}/api/canvas/shape/actions`;

const sizes = process.argv
  .slice(2)
  .map(Number)
  .filter((size) => Number.isInteger(size) && size > 0);

if (sizes.length === 0) sizes.push(10, 100, 500);

const user = await RepoUser.searchByPk({ id: 1 });

if (user === null) throw new Error('В БД нет пользователя 1, проверьте сид');

await GLOBAL_DB_MANAGER.close();

const token = ServiceToken.generateAccessToken({
  id: user.id,
  uuid: user.uuid,
  login: user.login,
  displayName: user.displayName,
  isActivated: user.isActivated,
});

function shapeId(n: number): string {
  return `shape-${String(n).padStart(4, '0')}`;
}

/** Отправляет пакет обновлений фигур [from, from + size) и возвращает время. */
async function sendBatch(from: number, size: number): Promise<number> {
  const actions = Array.from({ length: size }, (_, i) => ({
    operation: 'update',
    shape_id: shapeId(((from + i - 1) % SHAPES_IN_SEED) + 1),
    content: { type: 'sticker', text: `bench ${Date.now()}` },
  }));

  const startedAt = performance.now();

  const response = await fetch(URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ canvas_id: CANVAS_ID, actions }),
  });

  const result = (await response.json()) as {
    done?: unknown[];
    failed?: unknown[];
  };

  const elapsed = performance.now() - startedAt;

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(result)}`);
  }

  if (result.failed !== undefined && result.failed.length > 0) {
    console.warn(`  ! неуспешных действий: ${result.failed.length}`);
  }

  return elapsed;
}

console.log('Последовательные пакеты:');

for (const size of sizes) {
  const elapsed = await sendBatch(1, size);

  console.log(
    `  ${String(size).padStart(5)} элементов: ${elapsed.toFixed(0).padStart(6)} мс` +
      `  (${(elapsed / size).toFixed(2)} мс на элемент)`,
  );
}

const parallelSize = Math.min(Math.max(...sizes), SHAPES_IN_SEED / 2);

console.log(
  `\nДва параллельных пакета по ${parallelSize} разных фигур одного холста:`,
);

const [first, second] = await Promise.all([
  sendBatch(1, parallelSize),
  sendBatch(SHAPES_IN_SEED / 2 + 1, parallelSize),
]);

console.log(`  первый: ${first.toFixed(0)} мс`);
console.log(`  второй: ${second.toFixed(0)} мс`);
