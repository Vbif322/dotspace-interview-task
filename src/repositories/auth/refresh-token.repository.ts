import type { Transaction } from 'sequelize';

import { GLOBAL_DB_MANAGER } from '#scripts/db.script.js';
import { ErrorExtended } from '#utilities/exceptions/index.js';

import type { IModelRefreshTokenAttributes } from '#models/index.js';

interface IPropsCreate {
  userId: number;
  token: string;
  userAgent: string | null;
  expireAt: Date;
}

class RepoRefreshToken {
  async create(
    values: IPropsCreate,
    transaction?: Transaction,
  ): Promise<IModelRefreshTokenAttributes> {
    try {
      const refreshToken =
        await GLOBAL_DB_MANAGER.models.ModelRefreshToken.create(values, {
          transaction,
        });

      return refreshToken.get();
    } catch (error) {
      throw ErrorExtended.App.DB.FailedCRUD(
        { message: 'Произошла ошибка при сохранении refresh-токена' },
        error,
      );
    }
  }
}

const repoInstance = new RepoRefreshToken();

export { repoInstance as RepoRefreshToken };
