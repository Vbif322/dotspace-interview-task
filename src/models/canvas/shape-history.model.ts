import { DataTypes, Model } from 'sequelize';
import type { Optional, Sequelize } from 'sequelize';

import type { IShapeContent } from './shape.model.js';

interface IModelShapeHistoryAttributes {
  id: number;
  canvasId: number;
  shapeId: string;
  content: IShapeContent;
  rank: number;
  version: number;
  isDeleted: boolean;
  canvasVersion: number;
  updaterId: number;
  createdAt: Date;
}

type IModelShapeHistoryCreationAttributes = Optional<
  IModelShapeHistoryAttributes,
  'id' | 'createdAt'
>;

/** Запись истории изменения фигуры. */
class ModelShapeHistory
  extends Model<
    IModelShapeHistoryAttributes,
    IModelShapeHistoryCreationAttributes
  >
  implements IModelShapeHistoryAttributes
{
  declare id: number;
  declare canvasId: number;
  declare shapeId: string;
  declare content: IShapeContent;
  declare rank: number;
  declare version: number;
  declare isDeleted: boolean;
  declare canvasVersion: number;
  declare updaterId: number;
  declare createdAt: Date;

  static initialize(sequelize: Sequelize): typeof ModelShapeHistory {
    ModelShapeHistory.init(
      {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        canvasId: { type: DataTypes.INTEGER, allowNull: false },
        shapeId: { type: DataTypes.STRING(64), allowNull: false },
        content: { type: DataTypes.JSONB, allowNull: false },
        rank: { type: DataTypes.INTEGER, allowNull: false },
        version: { type: DataTypes.INTEGER, allowNull: false },
        isDeleted: { type: DataTypes.BOOLEAN, allowNull: false },
        canvasVersion: { type: DataTypes.INTEGER, allowNull: false },
        updaterId: { type: DataTypes.INTEGER, allowNull: false },
        createdAt: { type: DataTypes.DATE, allowNull: false },
      },
      {
        sequelize,
        tableName: 'wb_shape_history',
        underscored: true,
        updatedAt: false,
      },
    );

    return ModelShapeHistory;
  }
}

export { ModelShapeHistory };
export type {
  IModelShapeHistoryAttributes,
  IModelShapeHistoryCreationAttributes,
};
