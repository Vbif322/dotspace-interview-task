import { DataTypes, Model } from 'sequelize';
import type { Optional, Sequelize } from 'sequelize';

interface IModelUserEmailAttributes {
  id: number;
  userId: number;
  email: string;
  isConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type IModelUserEmailCreationAttributes = Optional<
  IModelUserEmailAttributes,
  'id' | 'isConfirmed' | 'createdAt' | 'updatedAt'
>;

/** Почтовый адрес пользователя. */
class ModelUserEmail
  extends Model<IModelUserEmailAttributes, IModelUserEmailCreationAttributes>
  implements IModelUserEmailAttributes
{
  declare id: number;
  declare userId: number;
  declare email: string;
  declare isConfirmed: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initialize(sequelize: Sequelize): typeof ModelUserEmail {
    ModelUserEmail.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        userId: { type: DataTypes.INTEGER, allowNull: false },
        email: { type: DataTypes.STRING(255), allowNull: false },
        isConfirmed: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      },
      { sequelize, tableName: 'wb_user_emails', underscored: true },
    );

    return ModelUserEmail;
  }
}

export { ModelUserEmail };
export type { IModelUserEmailAttributes, IModelUserEmailCreationAttributes };
