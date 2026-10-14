import type { Sequelize } from 'sequelize';

import { ModelConfirmation } from './auth/confirmation.model.js';
import { ModelRefreshToken } from './auth/refresh-token.model.js';
import { ModelUserEmail } from './auth/user-email.model.js';
import { ModelUser } from './auth/user.model.js';
import { ModelCanvasParticipant } from './canvas/canvas-participant.model.js';
import { ModelCanvas } from './canvas/canvas.model.js';
import { ModelShapeHistory } from './canvas/shape-history.model.js';
import { ModelShape } from './canvas/shape.model.js';

interface IDbModels {
  ModelUser: typeof ModelUser;
  ModelUserEmail: typeof ModelUserEmail;
  ModelConfirmation: typeof ModelConfirmation;
  ModelRefreshToken: typeof ModelRefreshToken;
  ModelCanvas: typeof ModelCanvas;
  ModelCanvasParticipant: typeof ModelCanvasParticipant;
  ModelShape: typeof ModelShape;
  ModelShapeHistory: typeof ModelShapeHistory;
}

/** Инициализирует все модели на переданном подключении. */
function initializeModels(sequelize: Sequelize): IDbModels {
  return {
    ModelUser: ModelUser.initialize(sequelize),
    ModelUserEmail: ModelUserEmail.initialize(sequelize),
    ModelConfirmation: ModelConfirmation.initialize(sequelize),
    ModelRefreshToken: ModelRefreshToken.initialize(sequelize),
    ModelCanvas: ModelCanvas.initialize(sequelize),
    ModelCanvasParticipant: ModelCanvasParticipant.initialize(sequelize),
    ModelShape: ModelShape.initialize(sequelize),
    ModelShapeHistory: ModelShapeHistory.initialize(sequelize),
  };
}

export { initializeModels };
export type { IDbModels };

export { EConfirmationType } from './auth/confirmation.model.js';
export { ECanvasParticipantRole } from './canvas/canvas-participant.model.js';

export type { IModelConfirmationAttributes } from './auth/confirmation.model.js';
export type { IModelRefreshTokenAttributes } from './auth/refresh-token.model.js';
export type { IModelUserEmailAttributes } from './auth/user-email.model.js';
export type { IModelUserAttributes } from './auth/user.model.js';
export type { IModelCanvasParticipantAttributes } from './canvas/canvas-participant.model.js';
export type { IModelCanvasAttributes } from './canvas/canvas.model.js';
export type { IModelShapeHistoryAttributes } from './canvas/shape-history.model.js';
export type {
  IModelShapeAttributes,
  IShapeContent,
} from './canvas/shape.model.js';
