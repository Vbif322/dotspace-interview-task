import type { Transaction } from 'sequelize';

import { RepoCanvas } from '#repositories/canvas/canvas.repository.js';
import { RepoShapeHistory } from '#repositories/canvas/shape-history.repository.js';
import { ServiceCanvasParticipant } from '#services/canvas/canvas-participant.service.js';

import type {
  IModelShapeAttributes,
  IModelShapeHistoryAttributes,
} from '#models/index.js';

interface IPropsReceiveSnapshot {
  canvasId: number;
  shapeId?: string;
  createdAt: Date;
}

type ISnapshotShape = Omit<IModelShapeHistoryAttributes, 'id'>;

/**
 * История изменений фигур.
 */
class ServiceShapeHistory {
  /** Возвращает состояние фигур холста на указанный момент времени. */
  async receiveSnapshot(
    search: IPropsReceiveSnapshot,
    context: { actorId: number },
  ): Promise<ISnapshotShape[]> {
    await ServiceCanvasParticipant.assertAccess(
      search.canvasId,
      context.actorId,
    );

    return await RepoShapeHistory.searchSnapshot(search);
  }

  /**
   * Фиксирует изменение фигуры: увеличивает версию холста
   * и записывает состояние фигуры в историю.
   */
  async write(
    shape: IModelShapeAttributes,
    transaction: Transaction,
  ): Promise<number> {
    const canvasVersion = await RepoCanvas.incrementVersion(
      { id: shape.canvasId },
      transaction,
    );

    await RepoShapeHistory.create(
      {
        canvasId: shape.canvasId,
        shapeId: shape.shapeId,
        content: shape.content,
        rank: shape.rank,
        version: shape.version,
        isDeleted: shape.isDeleted,
        canvasVersion,
        updaterId: shape.updaterId,
      },
      transaction,
    );

    return canvasVersion;
  }
}

const serviceInstance = new ServiceShapeHistory();

export { serviceInstance as ServiceShapeHistory };
export type { ISnapshotShape };
