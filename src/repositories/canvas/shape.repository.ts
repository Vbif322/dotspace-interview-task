import type { LOCK, Transaction } from 'sequelize';

import { GLOBAL_DB_MANAGER } from '#scripts/db.script.js';
import { ErrorExtended } from '#utilities/exceptions/index.js';

import type { IModelShapeAttributes, IShapeContent } from '#models/index.js';

interface IPropsCreate {
  canvasId: number;
  shapeId: string;
  content: IShapeContent;
  rank: number;
  creatorId: number;
  updaterId: number;
}

type IPropsUpdate = Partial<
  Pick<
    IModelShapeAttributes,
    'content' | 'rank' | 'version' | 'isDeleted' | 'updaterId'
  >
>;

class RepoShape {
  async searchOne(
    search: { canvasId: number; shapeId: string },
    transaction?: Transaction,
    lock?: LOCK,
  ): Promise<IModelShapeAttributes | null> {
    try {
      const shape = await GLOBAL_DB_MANAGER.models.ModelShape.findOne({
        where: { canvasId: search.canvasId, shapeId: search.shapeId },
        transaction,
        lock,
      });

      return shape?.get() ?? null;
    } catch (error) {
      throw ErrorExtended.App.DB.FailedCRUD(
        { message: 'Произошла ошибка при поиске фигуры' },
        error,
      );
    }
  }

  async create(
    values: IPropsCreate,
    transaction?: Transaction,
  ): Promise<IModelShapeAttributes> {
    try {
      const shape = await GLOBAL_DB_MANAGER.models.ModelShape.create(values, {
        transaction,
      });

      return shape.get();
    } catch (error) {
      throw ErrorExtended.App.DB.FailedCRUD(
        { message: 'Произошла ошибка при создании фигуры' },
        error,
      );
    }
  }

  async update(
    search: { id: number },
    values: IPropsUpdate,
    transaction?: Transaction,
  ): Promise<IModelShapeAttributes> {
    try {
      const [, [shape]] = await GLOBAL_DB_MANAGER.models.ModelShape.update(
        values,
        { where: { id: search.id }, returning: true, transaction },
      );

      return shape.get();
    } catch (error) {
      throw ErrorExtended.App.DB.FailedCRUD(
        { message: 'Произошла ошибка при обновлении фигуры' },
        error,
      );
    }
  }
}

const repoInstance = new RepoShape();

export { repoInstance as RepoShape };
