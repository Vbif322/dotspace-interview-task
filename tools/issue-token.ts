/**
 * Выпускает access-токен для пользователя из сида.
 * Использование: npm run token -- <userId>
 */
import { GLOBAL_DB_MANAGER } from '#scripts/db.script.js';

import { RepoUser } from '#repositories/auth/user.repository.js';
import { ServiceToken } from '#services/auth/token.service.js';

const userId = Number(process.argv[2] ?? 1);

const user = await RepoUser.searchByPk({ id: userId });

if (user === null) {
  console.error(`Пользователь ${userId} не найден`);
  process.exitCode = 1;
} else {
  console.log(
    ServiceToken.generateAccessToken({
      id: user.id,
      uuid: user.uuid,
      login: user.login,
      displayName: user.displayName,
      isActivated: user.isActivated,
    }),
  );
}

await GLOBAL_DB_MANAGER.close();
