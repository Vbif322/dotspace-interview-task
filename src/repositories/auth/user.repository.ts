import { Op } from 'sequelize';
import type { Transaction } from 'sequelize';

import { GLOBAL_DB_MANAGER } from '#scripts/db.script.js';
import { ErrorExtended } from '#utilities/exceptions/index.js';

import type { IModelUserAttributes } from '#models/index.js';

type IPropsUpdate = Partial<
  Pick<IModelUserAttributes, 'displayName' | 'isActivated' | 'isBlocked'>
>;

class RepoUser {
  async searchByPk(
    search: { id: number },
    transaction?: Transaction,
  ): Promise<IModelUserAttributes | null> {
    try {
      const user = await GLOBAL_DB_MANAGER.models.ModelUser.findByPk(
        search.id,
        { transaction },
      );

      return user?.get() ?? null;
    } catch (error) {
      throw ErrorExtended.App.DB.FailedCRUD(
        { message: 'Произошла ошибка при поиске пользователя' },
        error,
      );
    }
  }

  async searchManyByPk(
    search: { ids: number[] },
    transaction?: Transaction,
  ): Promise<IModelUserAttributes[]> {
    try {
      const users = await GLOBAL_DB_MANAGER.models.ModelUser.findAll({
        where: { id: { [Op.in]: search.ids } },
        transaction,
      });

      return users.map((user) => user.get());
    } catch (error) {
      throw ErrorExtended.App.DB.FailedCRUD(
        { message: 'Произошла ошибка при поиске пользователей' },
        error,
      );
    }
  }

  async update(
    search: { id: number },
    values: IPropsUpdate,
    transaction?: Transaction,
  ): Promise<IModelUserAttributes> {
    try {
      const [, [user]] = await GLOBAL_DB_MANAGER.models.ModelUser.update(
        values,
        { where: { id: search.id }, returning: true, transaction },
      );

      return user.get();
    } catch (error) {
      throw ErrorExtended.App.DB.FailedCRUD(
        { message: 'Произошла ошибка при обновлении пользователя' },
        error,
      );
    }
  }
}

const repoInstance = new RepoUser();

export { repoInstance as RepoUser };
