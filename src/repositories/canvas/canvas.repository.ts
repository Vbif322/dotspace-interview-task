import { QueryTypes } from 'sequelize';
import type { Transaction } from 'sequelize';

import { GLOBAL_DB_MANAGER } from '#scripts/db.script.js';
import { ErrorExtended } from '#utilities/exceptions/index.js';

import type { IModelCanvasAttributes } from '#models/index.js';

class RepoCanvas {
  async searchByPk(
    search: { id: number },
    transaction?: Transaction,
  ): Promise<IModelCanvasAttributes | null> {
    try {
      const canvas = await GLOBAL_DB_MANAGER.models.ModelCanvas.findByPk(
        search.id,
        { transaction },
      );

      return canvas?.get() ?? null;
    } catch (error) {
      throw ErrorExtended.App.DB.FailedCRUD(
        { message: 'Произошла ошибка при поиске холста' },
        error,
      );
    }
  }

  /** Увеличивает версию холста на единицу и возвращает новое значение. */
  async incrementVersion(
    search: { id: number },
    transaction: Transaction,
  ): Promise<number> {
    let rows: Array<{ version: number }>;

    try {
      rows = await GLOBAL_DB_MANAGER.connection.query<{ version: number }>(
        `
          UPDATE wb_canvases
          SET    version = version + 1, updated_at = NOW()
          WHERE  id = :canvasId
          RETURNING version;
        `,
        {
          type: QueryTypes.SELECT,
          replacements: { canvasId: search.id },
          transaction,
        },
      );
    } catch (error) {
      throw ErrorExtended.App.DB.FailedCRUD(
        { message: 'Произошла ошибка при обновлении версии холста' },
        error,
      );
    }

    if (rows.length === 0) {
      throw ErrorExtended.App.DB.NotFoundRecord({
        message: 'Холст не найден',
      });
    }

    return rows[0].version;
  }
}

const repoInstance = new RepoCanvas();

export { repoInstance as RepoCanvas };
