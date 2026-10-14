import type { Transaction } from 'sequelize';

import { GLOBAL_DB_MANAGER } from '#scripts/db.script.js';
import { ErrorExtended } from '#utilities/exceptions/index.js';

import type { IModelUserEmailAttributes } from '#models/index.js';

interface IPropsSearch {
  id?: number;
  userId?: number;
  isConfirmed?: boolean;
}

class RepoUserEmail {
  async find(
    search: IPropsSearch,
    transaction?: Transaction,
  ): Promise<IModelUserEmailAttributes | null> {
    try {
      const email = await GLOBAL_DB_MANAGER.models.ModelUserEmail.findOne({
        where: { ...search },
        transaction,
      });

      return email?.get() ?? null;
    } catch (error) {
      throw ErrorExtended.App.DB.FailedCRUD(
        { message: 'Произошла ошибка при поиске почтового адреса' },
        error,
      );
    }
  }

  async update(
    search: IPropsSearch,
    values: Partial<Pick<IModelUserEmailAttributes, 'isConfirmed'>>,
    transaction?: Transaction,
  ): Promise<number> {
    try {
      const [count] = await GLOBAL_DB_MANAGER.models.ModelUserEmail.update(
        values,
        { where: { ...search }, transaction },
      );

      return count;
    } catch (error) {
      throw ErrorExtended.App.DB.FailedCRUD(
        { message: 'Произошла ошибка при обновлении почтового адреса' },
        error,
      );
    }
  }
}

const repoInstance = new RepoUserEmail();

export { repoInstance as RepoUserEmail };
