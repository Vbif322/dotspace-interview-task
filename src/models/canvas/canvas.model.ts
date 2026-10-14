import { DataTypes, Model } from 'sequelize';
import type { Optional, Sequelize } from 'sequelize';
import type { UUID } from 'crypto';

interface IModelCanvasAttributes {
  id: number;
  uuid: UUID;
  title: string;
  ownerId: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

type IModelCanvasCreationAttributes = Optional<
  IModelCanvasAttributes,
  'id' | 'uuid' | 'version' | 'createdAt' | 'updatedAt'
>;

/** Холст. Поле `version` растёт при каждом изменении фигур. */
class ModelCanvas
  extends Model<IModelCanvasAttributes, IModelCanvasCreationAttributes>
  implements IModelCanvasAttributes
{
  declare id: number;
  declare uuid: UUID;
  declare title: string;
  declare ownerId: number;
  declare version: number;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initialize(sequelize: Sequelize): typeof ModelCanvas {
    ModelCanvas.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        uuid: {
          type: DataTypes.UUID,
          allowNull: false,
          defaultValue: DataTypes.UUIDV4,
        },
        title: { type: DataTypes.STRING(255), allowNull: false },
        ownerId: { type: DataTypes.INTEGER, allowNull: false },
        version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      },
      { sequelize, tableName: 'wb_canvases', underscored: true },
    );

    return ModelCanvas;
  }
}

export { ModelCanvas };
export type { IModelCanvasAttributes, IModelCanvasCreationAttributes };
