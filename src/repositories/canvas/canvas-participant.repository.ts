import type { Transaction, WhereOptions } from 'sequelize';

import { GLOBAL_DB_MANAGER } from '#scripts/db.script.js';
import { ErrorExtended } from '#utilities/exceptions/index.js';

import type {
  ECanvasParticipantRole,
  IModelCanvasParticipantAttributes,
} from '#models/index.js';

interface IPropsSearchMany {
  canvasId: number;
  role?: ECanvasParticipantRole;
}

interface IPropsSearchOptional {
  offset?: number;
  limit?: number;
}

class RepoCanvasParticipant {
  async searchOne(
    search: { canvasId: number; userId: number },
    transaction?: Transaction,
  ): Promise<IModelCanvasParticipantAttributes | null> {
    try {
      const participant =
        await GLOBAL_DB_MANAGER.models.ModelCanvasParticipant.findOne({
          where: { canvasId: search.canvasId, userId: search.userId },
          transaction,
        });

      return participant?.get() ?? null;
    } catch (error) {
      throw ErrorExtended.App.DB.FailedCRUD(
        { message: 'Произошла ошибка при поиске участника холста' },
        error,
      );
    }
  }

  async searchMany(
    search: IPropsSearchMany,
    optional?: IPropsSearchOptional,
    transaction?: Transaction,
  ): Promise<IModelCanvasParticipantAttributes[]> {
    const where: WhereOptions<IModelCanvasParticipantAttributes> = {
      canvasId: search.canvasId,
    };

    if (search.role !== undefined) {
      where.role = search.role;
    }

    try {
      const participants =
        await GLOBAL_DB_MANAGER.models.ModelCanvasParticipant.findAll({
          where,
          offset: optional?.offset,
          limit: optional?.limit,
          order: [['id', 'ASC']],
          transaction,
        });

      return participants.map((participant) => participant.get());
    } catch (error) {
      throw ErrorExtended.App.DB.FailedCRUD(
        { message: 'Произошла ошибка при поиске участников холста' },
        error,
      );
    }
  }
}

const repoInstance = new RepoCanvasParticipant();

export { repoInstance as RepoCanvasParticipant };
