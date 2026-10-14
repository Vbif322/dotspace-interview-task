import type { Transaction } from 'sequelize';

import { GLOBAL_DB_MANAGER } from '#scripts/db.script.js';
import { ErrorApp, ErrorExtended } from '#utilities/exceptions/index.js';

import { RepoShape } from '#repositories/canvas/shape.repository.js';
import { ServiceCanvasParticipant } from '#services/canvas/canvas-participant.service.js';
import { ServiceShapeHistory } from '#services/canvas/shape-history.service.js';

import { ECanvasParticipantRole } from '#models/index.js';
import type { IModelShapeAttributes, IShapeContent } from '#models/index.js';

enum EShapeOperation {
  ADD = 'add',
  UPDATE = 'update',
  DELETE = 'delete',
}

interface IShapeAction {
  operation: EShapeOperation;
  shapeId: string;
  content?: IShapeContent;
  rank?: number;
  version?: number;
}

interface IShapeActionDone {
  operation: EShapeOperation;
  shape: IModelShapeAttributes;
}

interface IShapeActionFailed extends IShapeAction {
  reason: { code: string; message: string };
}

interface IShapeActionResult {
  canvasId: number;
  done: IShapeActionDone[];
  failed: IShapeActionFailed[];
}

interface IContext {
  actorId: number;
}

/**
 * Применяет пакет изменений фигур холста.
 * Действия выполняются в исходном порядке; ошибка одного действия
 * не отменяет остальные и возвращается в `failed`.
 */
class ServiceShapeAction {
  async actions(
    props: { canvasId: number; actions: IShapeAction[] },
    context: IContext,
  ): Promise<IShapeActionResult> {
    await ServiceCanvasParticipant.assertAccess(
      props.canvasId,
      context.actorId,
      [ECanvasParticipantRole.OWNER, ECanvasParticipantRole.EDITOR],
    );

    const done: IShapeActionDone[] = [];
    const failed: IShapeActionFailed[] = [];

    await GLOBAL_DB_MANAGER.managedTransaction(async (rootTransaction) => {
      for (const action of props.actions) {
        try {
          const shape = await GLOBAL_DB_MANAGER.managedTransaction(
            async (actionTransaction) =>
              await this.execute(
                props.canvasId,
                action,
                context,
                actionTransaction,
              ),
            { transaction: rootTransaction },
          );

          done.push({ operation: action.operation, shape });
        } catch (error) {
          failed.push({ ...action, reason: this.normalizeError(error) });
        }
      }
    });

    return { canvasId: props.canvasId, done, failed };
  }

  private async execute(
    canvasId: number,
    action: IShapeAction,
    context: IContext,
    transaction: Transaction,
  ): Promise<IModelShapeAttributes> {
    let shape: IModelShapeAttributes;

    switch (action.operation) {
      case EShapeOperation.ADD:
        shape = await this.add(canvasId, action, context, transaction);
        break;
      case EShapeOperation.UPDATE:
        shape = await this.update(canvasId, action, context, transaction);
        break;
      case EShapeOperation.DELETE:
        shape = await this.delete(canvasId, action, context, transaction);
        break;
    }

    await ServiceShapeHistory.write(shape, transaction);

    return shape;
  }

  private async add(
    canvasId: number,
    action: IShapeAction,
    context: IContext,
    transaction: Transaction,
  ): Promise<IModelShapeAttributes> {
    const existing = await RepoShape.searchOne(
      { canvasId, shapeId: action.shapeId },
      transaction,
    );

    if (existing !== null) {
      throw ErrorExtended.App.DB.AlreadyExists({
        message: `Фигура ${action.shapeId} уже существует`,
      });
    }

    if (action.content === undefined) {
      throw ErrorExtended.Response.Client.BadRequest({
        message: 'Для создания фигуры требуется content',
      });
    }

    return await RepoShape.create(
      {
        canvasId,
        shapeId: action.shapeId,
        content: action.content,
        rank: action.rank ?? 0,
        creatorId: context.actorId,
        updaterId: context.actorId,
      },
      transaction,
    );
  }

  private async update(
    canvasId: number,
    action: IShapeAction,
    context: IContext,
    transaction: Transaction,
  ): Promise<IModelShapeAttributes> {
    const existing = await this.receiveForChange(canvasId, action, transaction);

    return await RepoShape.update(
      { id: existing.id },
      {
        content: action.content ?? existing.content,
        rank: action.rank ?? existing.rank,
        version: existing.version + 1,
        updaterId: context.actorId,
      },
      transaction,
    );
  }

  private async delete(
    canvasId: number,
    action: IShapeAction,
    context: IContext,
    transaction: Transaction,
  ): Promise<IModelShapeAttributes> {
    const existing = await this.receiveForChange(canvasId, action, transaction);

    return await RepoShape.update(
      { id: existing.id },
      {
        isDeleted: true,
        version: existing.version + 1,
        updaterId: context.actorId,
      },
      transaction,
    );
  }

  /** Блокирует фигуру для изменения и проверяет её версию. */
  private async receiveForChange(
    canvasId: number,
    action: IShapeAction,
    transaction: Transaction,
  ): Promise<IModelShapeAttributes> {
    const existing = await RepoShape.searchOne(
      { canvasId, shapeId: action.shapeId },
      transaction,
      transaction.LOCK.UPDATE,
    );

    if (existing === null || existing.isDeleted) {
      throw ErrorExtended.App.DB.NotFoundRecord({
        message: `Фигура ${action.shapeId} не найдена`,
      });
    }

    if (action.version !== undefined && action.version !== existing.version) {
      throw ErrorExtended.App.DB.VersionConflict({
        message: `Версия фигуры ${action.shapeId} устарела`,
      });
    }

    return existing;
  }

  private normalizeError(error: unknown): { code: string; message: string } {
    if (error instanceof ErrorApp) {
      return { code: error.code, message: error.message };
    }

    return { code: 'INTERNAL', message: 'Внутренняя ошибка' };
  }
}

const serviceInstance = new ServiceShapeAction();

export { EShapeOperation, serviceInstance as ServiceShapeAction };
export type { IShapeAction, IShapeActionResult };
