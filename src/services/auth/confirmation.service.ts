import type { Transaction } from 'sequelize';

import { DateTimeProps } from '#utilities/datetime-props.class.js';
import { ErrorExtended } from '#utilities/exceptions/index.js';

import { RepoConfirmation } from '#repositories/auth/confirmation.repository.js';

import type {
  EConfirmationType,
  IModelConfirmationAttributes,
} from '#models/index.js';

/**
 * Одноразовые подтверждения действий пользователя
 * (активация аккаунта, восстановление пароля).
 */
class ServiceConfirmation {
  /**
   * Ищет действующее подтверждение по токену и блокирует его до конца
   * транзакции, чтобы один токен нельзя было использовать дважды.
   */
  async findByToken(
    token: string,
    type: EConfirmationType,
    transaction?: Transaction,
  ): Promise<IModelConfirmationAttributes | null> {
    const confirmation = await RepoConfirmation.find(
      { token, type },
      transaction,
      transaction?.LOCK.UPDATE,
    );

    if (confirmation !== null) {
      const now = await DateTimeProps.now();

      if (confirmation.expireAt < now) {
        throw ErrorExtended.App.Entity.Confirmation.Expired();
      }
    }

    return confirmation;
  }

  async clearById(id: number, transaction?: Transaction): Promise<void> {
    await RepoConfirmation.delete({ id }, transaction);
  }
}

const serviceInstance = new ServiceConfirmation();

export { serviceInstance as ServiceConfirmation };
