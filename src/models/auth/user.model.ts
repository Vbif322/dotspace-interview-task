import { DataTypes, Model } from 'sequelize';
import type { Optional, Sequelize } from 'sequelize';
import type { UUID } from 'crypto';

interface IModelUserAttributes {
  id: number;
  uuid: UUID;
  login: string;
  displayName: string;
  isActivated: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type IModelUserCreationAttributes = Optional<
  IModelUserAttributes,
  'id' | 'uuid' | 'isActivated' | 'isBlocked' | 'createdAt' | 'updatedAt'
>;

/** Пользователь. */
class ModelUser
  extends Model<IModelUserAttributes, IModelUserCreationAttributes>
  implements IModelUserAttributes
{
  declare id: number;
  declare uuid: UUID;
  declare login: string;
  declare displayName: string;
  declare isActivated: boolean;
  declare isBlocked: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initialize(sequelize: Sequelize): typeof ModelUser {
    ModelUser.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        uuid: {
          type: DataTypes.UUID,
          allowNull: false,
          defaultValue: DataTypes.UUIDV4,
        },
        login: { type: DataTypes.STRING(64), allowNull: false },
        displayName: { type: DataTypes.STRING(128), allowNull: false },
        isActivated: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        isBlocked: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      },
      { sequelize, tableName: 'wb_users', underscored: true },
    );

    return ModelUser;
  }
}

export { ModelUser };
export type { IModelUserAttributes, IModelUserCreationAttributes };
