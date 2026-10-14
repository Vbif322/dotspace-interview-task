import { DataTypes, Model } from 'sequelize';
import type { Optional, Sequelize } from 'sequelize';

type IShapeContent = Record<string, unknown>;

interface IModelShapeAttributes {
  id: number;
  canvasId: number;
  shapeId: string;
  content: IShapeContent;
  rank: number;
  version: number;
  isDeleted: boolean;
  creatorId: number;
  updaterId: number;
  createdAt: Date;
  updatedAt: Date;
}

type IModelShapeCreationAttributes = Optional<
  IModelShapeAttributes,
  'id' | 'rank' | 'version' | 'isDeleted' | 'createdAt' | 'updatedAt'
>;

/** Текущее состояние фигуры на холсте. */
class ModelShape
  extends Model<IModelShapeAttributes, IModelShapeCreationAttributes>
  implements IModelShapeAttributes
{
  declare id: number;
  declare canvasId: number;
  declare shapeId: string;
  declare content: IShapeContent;
  declare rank: number;
  declare version: number;
  declare isDeleted: boolean;
  declare creatorId: number;
  declare updaterId: number;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initialize(sequelize: Sequelize): typeof ModelShape {
    ModelShape.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        canvasId: { type: DataTypes.INTEGER, allowNull: false },
        shapeId: { type: DataTypes.STRING(64), allowNull: false },
        content: { type: DataTypes.JSONB, allowNull: false },
        rank: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        isDeleted: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        creatorId: { type: DataTypes.INTEGER, allowNull: false },
        updaterId: { type: DataTypes.INTEGER, allowNull: false },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      },
      { sequelize, tableName: 'wb_shapes', underscored: true },
    );

    return ModelShape;
  }
}

export { ModelShape };
export type {
  IModelShapeAttributes,
  IModelShapeCreationAttributes,
  IShapeContent,
};
