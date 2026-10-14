import { QueryTypes } from 'sequelize';
import type { Transaction } from 'sequelize';

import { GLOBAL_DB_MANAGER } from '#scripts/db.script.js';
import { DateTimeProps } from '#utilities/datetime-props.class.js';
import { ErrorExtended } from '#utilities/exceptions/index.js';

import type {
  IModelShapeHistoryAttributes,
  IShapeContent,
} from '#models/index.js';

interface IPropsCreate {
  canvasId: number;
  shapeId: string;
  content: IShapeContent;
  rank: number;
  version: number;
  isDeleted: boolean;
  canvasVersion: number;
  updaterId: number;
}

interface IPropsSearchSnapshot {
  canvasId: number;
  shapeId?: string;
  createdAt: Date;
}

type ISnapshotRow = Omit<IModelShapeHistoryAttributes, 'id'>;

class RepoShapeHistory {
  async create(
    values: IPropsCreate,
    transaction?: Transaction,
  ): Promise<IModelShapeHistoryAttributes> {
    try {
      const record = await GLOBAL_DB_MANAGER.models.ModelShapeHistory.create(
        values,
        { transaction },
      );

      return record.get();
    } catch (error) {
      throw ErrorExtended.App.DB.FailedCRUD(
        { message: 'Произошла ошибка при записи истории фигуры' },
        error,
      );
    }
  }

  /**
   * Восстанавливает состояние фигур холста на указанный момент времени
   * по истории изменений.
   */
  async searchSnapshot(search: IPropsSearchSnapshot): Promise<ISnapshotRow[]> {
    try {
      const sql = `
        -- Версия холста на указанный момент
        WITH canvas_version_boundary AS (
          SELECT COALESCE((
            SELECT boundary.canvas_version
            FROM   wb_shape_history AS boundary
            WHERE  boundary.canvas_id = ${search.canvasId}
              AND  boundary.created_at <= '${DateTimeProps.toISO(search.createdAt)}'
            ORDER BY boundary.created_at DESC, boundary.canvas_version DESC
            LIMIT 1
          ), 0) AS canvas_version
        ),
        -- Последние версии фигур не позднее найденной версии холста
        latest_history AS (
          SELECT DISTINCT ON (history.shape_id)
            history.canvas_id, history.shape_id, history.content, history.rank,
            history.version, history.is_deleted, history.canvas_version,
            history.updater_id, history.created_at
          FROM   wb_shape_history AS history
          CROSS JOIN canvas_version_boundary AS boundary
          WHERE  history.canvas_id = ${search.canvasId}
            ${search.shapeId !== undefined ? `AND history.shape_id = '${search.shapeId}'` : ''}
            AND  history.canvas_version <= boundary.canvas_version
          ORDER BY history.shape_id, history.canvas_version DESC
        )
        SELECT
          canvas_id      AS "canvasId",
          shape_id       AS "shapeId",
          content,
          rank,
          version,
          is_deleted     AS "isDeleted",
          canvas_version AS "canvasVersion",
          updater_id     AS "updaterId",
          created_at     AS "createdAt"
        FROM   latest_history
        WHERE  is_deleted = FALSE
        ORDER BY rank ASC, canvas_version ASC;
      `;

      return await GLOBAL_DB_MANAGER.connection.query<ISnapshotRow>(sql, {
        type: QueryTypes.SELECT,
      });
    } catch (error) {
      throw ErrorExtended.App.DB.FailedCRUD(
        { message: 'Произошла ошибка при построении снимка холста' },
        error,
      );
    }
  }
}

const repoInstance = new RepoShapeHistory();

export { repoInstance as RepoShapeHistory };
