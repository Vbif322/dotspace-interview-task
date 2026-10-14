import { DataTypes, Model } from 'sequelize';
import type { Optional, Sequelize } from 'sequelize';

interface IModelRefreshTokenAttributes {
  id: number;
  userId: number;
  token: string;
  userAgent: string | null;
  expireAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

type IModelRefreshTokenCreationAttributes = Optional<
  IModelRefreshTokenAttributes,
  'id' | 'userAgent' | 'createdAt' | 'updatedAt'
>;

/** Refresh-токен сессии пользователя. */
class ModelRefreshToken
  extends Model<
    IModelRefreshTokenAttributes,
    IModelRefreshTokenCreationAttributes
  >
  implements IModelRefreshTokenAttributes
{
  declare id: number;
  declare userId: number;
  declare token: string;
  declare userAgent: string | null;
  declare expireAt: Date;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initialize(sequelize: Sequelize): typeof ModelRefreshToken {
    ModelRefreshToken.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        userId: { type: DataTypes.INTEGER, allowNull: false },
        token: { type: DataTypes.TEXT, allowNull: false },
        userAgent: { type: DataTypes.STRING(512), allowNull: true },
        expireAt: { type: DataTypes.DATE, allowNull: false },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      },
      { sequelize, tableName: 'wb_refresh_tokens', underscored: true },
    );

    return ModelRefreshToken;
  }
}

export { ModelRefreshToken };
export type {
  IModelRefreshTokenAttributes,
  IModelRefreshTokenCreationAttributes,
};
