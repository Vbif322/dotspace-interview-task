import { GLOBAL_DB_MANAGER } from '#scripts/db.script.js';
import { ErrorExtended } from '#utilities/exceptions/index.js';

import { RepoUserEmail } from '#repositories/auth/user-email.repository.js';
import { RepoUser } from '#repositories/auth/user.repository.js';
import { ServiceConfirmation } from '#services/auth/confirmation.service.js';
import { ServiceToken } from '#services/auth/token.service.js';
import type {
  IAccessTokenPayload,
  IRefreshTokenPayload,
} from '#services/auth/token.service.js';

import { EConfirmationType } from '#models/index.js';

interface ITokenPackage {
  accessToken: string;
  refreshToken: string;
}

/**
 * Сценарии аутентификации пользователя.
 */
class ServiceAuth {
  /**
   * Активирует аккаунт по токену из письма: подтверждает почтовый адрес,
   * помечает пользователя активированным и открывает сессию.
   */
  async activate(
    token: string,
    userAgent: string | null,
  ): Promise<[number, ITokenPackage]> {
    const [accessPayload, refreshPayload] =
      await GLOBAL_DB_MANAGER.managedTransaction(
        async (
          transaction,
        ): Promise<[IAccessTokenPayload, IRefreshTokenPayload]> => {
          const confirmation = await ServiceConfirmation.findByToken(
            token,
            EConfirmationType.ACCOUNT_ACTIVATION,
            transaction,
          );

          if (confirmation === null) {
            throw ErrorExtended.App.DB.NotFoundRecord({
              message: 'Подтверждение активации не найдено',
            });
          }

          const user = await RepoUser.searchByPk(
            { id: confirmation.userId },
            transaction,
          );

          if (user === null) {
            await ServiceConfirmation.clearById(confirmation.id);

            throw ErrorExtended.App.DB.NotFoundRecord({
              message: 'Пользователь для подтверждения активации не найден',
            });
          }

          if (user.isBlocked) {
            // Подтверждение не удаляем: пользователя могут разблокировать
            throw ErrorExtended.App.Entity.User.Blocked();
          }

          const email = await RepoUserEmail.find(
            { userId: user.id, isConfirmed: false },
            transaction,
          );

          if (email === null) {
            await ServiceConfirmation.clearById(confirmation.id);

            throw ErrorExtended.App.DB.NotFoundRecord({
              message: 'Для активации не найден неподтверждённый адрес',
            });
          }

          await RepoUserEmail.update(
            { id: email.id },
            { isConfirmed: true },
            transaction,
          );

          const activatedUser = await RepoUser.update(
            { id: user.id },
            { isActivated: true },
            transaction,
          );

          await ServiceConfirmation.clearById(confirmation.id, transaction);

          return [
            {
              id: activatedUser.id,
              uuid: activatedUser.uuid,
              login: activatedUser.login,
              displayName: activatedUser.displayName,
              isActivated: activatedUser.isActivated,
            },
            {
              id: activatedUser.id,
              uuid: activatedUser.uuid,
            },
          ];
        },
      );

    const accessToken = ServiceToken.generateAccessToken(accessPayload);
    const refreshToken = ServiceToken.generateRefreshToken(refreshPayload);

    const savedRefreshToken = await ServiceToken.save(
      accessPayload.id,
      refreshToken,
      userAgent,
    );

    return [accessPayload.id, { accessToken, refreshToken: savedRefreshToken }];
  }
}

const serviceInstance = new ServiceAuth();

export { serviceInstance as ServiceAuth };
export type { ITokenPackage };
