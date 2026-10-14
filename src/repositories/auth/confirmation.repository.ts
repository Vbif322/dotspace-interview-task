import type { LOCK, Transaction } from 'sequelize';

import { GLOBAL_DB_MANAGER } from '#scripts/db.script.js';
import { ErrorExtended } from '#utilities/exceptions/index.js';

import type {
  EConfirmationType,
  IModelConfirmationAttributes,
} from '#models/index.js';

interface IPropsSearch {
  id?: number;
  token?: string;
  type?: EConfirmationType;
}

class RepoConfirmation {
  async find(
    search: IPropsSearch,
    transaction?: Transaction,
    lock?: LOCK,
  ): Promise<IModelConfirmationAttributes | null> {
    try {
      const confirmation =
        await GLOBAL_DB_MANAGER.models.ModelConfirmation.findOne({
          where: { ...search },
          transaction,
          lock,
        });

      return confirmation?.get() ?? null;
    } catch (error) {
      throw ErrorExtended.App.DB.FailedCRUD(
        { message: 'Произошла ошибка при поиске подтверждения' },
        error,
      );
    }
  }

  async delete(search: IPropsSearch, transaction?: Transaction): Promise<void> {
    try {
      await GLOBAL_DB_MANAGER.models.ModelConfirmation.destroy({
        where: { ...search },
        transaction,
      });
    } catch (error) {
      throw ErrorExtended.App.DB.FailedCRUD(
        { message: 'Произошла ошибка при удалении подтверждения' },
        error,
      );
    }
  }
}

const repoInstance = new RepoConfirmation();

export { repoInstance as RepoConfirmation };
