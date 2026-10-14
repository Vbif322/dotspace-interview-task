import type { UUID } from 'crypto';
import type { Transaction } from 'sequelize';

import { ErrorExtended } from '#utilities/exceptions/index.js';

import { RepoUser } from '#repositories/auth/user.repository.js';
import { RepoCanvasParticipant } from '#repositories/canvas/canvas-participant.repository.js';

import { ECanvasParticipantRole } from '#models/index.js';
import type { IModelCanvasParticipantAttributes } from '#models/index.js';

interface IPropsReceiveMany {
  canvasId: number;
  role?: ECanvasParticipantRole;
}

interface IPropsReceiveManyOptional {
  offset?: number;
  limit?: number;
}

interface ICanvasParticipantDto {
  userId: number;
  userUuid: UUID;
  displayName: string;
  role: ECanvasParticipantRole;
}

const ALL_ROLES: ECanvasParticipantRole[] = [
  ECanvasParticipantRole.OWNER,
  ECanvasParticipantRole.EDITOR,
  ECanvasParticipantRole.VIEWER,
];

/**
 * Участники холста и проверка доступа к холсту.
 */
class ServiceCanvasParticipant {
  /** Проверяет, что пользователь участвует в холсте с одной из ролей. */
  async assertAccess(
    canvasId: number,
    userId: number,
    roles: ECanvasParticipantRole[] = ALL_ROLES,
    transaction?: Transaction,
  ): Promise<IModelCanvasParticipantAttributes> {
    const participant = await RepoCanvasParticipant.searchOne(
      { canvasId, userId },
      transaction,
    );

    if (participant === null || !roles.includes(participant.role)) {
      throw ErrorExtended.Response.Client.Forbidden({
        message: 'Нет доступа к холсту',
      });
    }

    return participant;
  }

  async receiveMany(
    search: IPropsReceiveMany,
    optional: IPropsReceiveManyOptional,
    context: { actorId: number },
  ): Promise<ICanvasParticipantDto[]> {
    await this.assertAccess(search.canvasId, context.actorId);

    const participants = await RepoCanvasParticipant.searchMany(
      search,
      optional,
    );

    const users = await RepoUser.searchManyByPk({
      ids: participants.map((participant) => participant.userId),
    });

    const usersById = new Map(users.map((user) => [user.id, user]));

    return participants.flatMap((participant) => {
      const user = usersById.get(participant.userId);

      if (user === undefined) return [];

      return [
        {
          userId: user.id,
          userUuid: user.uuid,
          displayName: user.displayName,
          role: participant.role,
        },
      ];
    });
  }
}

const serviceInstance = new ServiceCanvasParticipant();

export { serviceInstance as ServiceCanvasParticipant };
export type { ICanvasParticipantDto };
