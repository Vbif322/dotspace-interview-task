import { DataTypes, Model } from 'sequelize';
import type { Optional, Sequelize } from 'sequelize';

enum EConfirmationType {
  ACCOUNT_ACTIVATION = 'account_activation',
  PASSWORD_RECOVERY = 'password_recovery',
}

interface IModelConfirmationAttributes {
  id: number;
  userId: number;
  token: string;
  type: EConfirmationType;
  expireAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

type IModelConfirmationCreationAttributes = Optional<
  IModelConfirmationAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

/** Одноразовый токен подтверждения действия пользователя. */
class ModelConfirmation
  extends Model<
    IModelConfirmationAttributes,
    IModelConfirmationCreationAttributes
  >
  implements IModelConfirmationAttributes
{
  declare id: number;
  declare userId: number;
  declare token: string;
  declare type: EConfirmationType;
  declare expireAt: Date;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initialize(sequelize: Sequelize): typeof ModelConfirmation {
    ModelConfirmation.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        userId: { type: DataTypes.INTEGER, allowNull: false },
        token: { type: DataTypes.STRING(64), allowNull: false },
        type: { type: DataTypes.STRING(32), allowNull: false },
        expireAt: { type: DataTypes.DATE, allowNull: false },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      },
      { sequelize, tableName: 'wb_confirmations', underscored: true },
    );

    return ModelConfirmation;
  }
}

export { EConfirmationType, ModelConfirmation };
export type {
  IModelConfirmationAttributes,
  IModelConfirmationCreationAttributes,
};
