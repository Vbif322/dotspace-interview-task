import { DataTypes, Model } from 'sequelize';
import type { Optional, Sequelize } from 'sequelize';

enum ECanvasParticipantRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

interface IModelCanvasParticipantAttributes {
  id: number;
  canvasId: number;
  userId: number;
  role: ECanvasParticipantRole;
  createdAt: Date;
  updatedAt: Date;
}

type IModelCanvasParticipantCreationAttributes = Optional<
  IModelCanvasParticipantAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

/** Участник холста и его роль. */
class ModelCanvasParticipant
  extends Model<
    IModelCanvasParticipantAttributes,
    IModelCanvasParticipantCreationAttributes
  >
  implements IModelCanvasParticipantAttributes
{
  declare id: number;
  declare canvasId: number;
  declare userId: number;
  declare role: ECanvasParticipantRole;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initialize(sequelize: Sequelize): typeof ModelCanvasParticipant {
    ModelCanvasParticipant.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        canvasId: { type: DataTypes.INTEGER, allowNull: false },
        userId: { type: DataTypes.INTEGER, allowNull: false },
        role: { type: DataTypes.STRING(16), allowNull: false },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      },
      { sequelize, tableName: 'wb_canvas_participants', underscored: true },
    );

    return ModelCanvasParticipant;
  }
}

export { ECanvasParticipantRole, ModelCanvasParticipant };
export type {
  IModelCanvasParticipantAttributes,
  IModelCanvasParticipantCreationAttributes,
};
