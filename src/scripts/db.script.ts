import { Sequelize } from 'sequelize';
import type { Transaction, TransactionOptions } from 'sequelize';

import { CONFIG } from '#utilities/config.js';

import { initializeModels } from '#models/index.js';
import type { IDbModels } from '#models/index.js';

/**
 * Менеджер подключения к основной БД и её моделей.
 */
class DbManager {
  readonly connection: Sequelize;
  readonly models: IDbModels;

  constructor() {
    this.connection = new Sequelize({
      dialect: 'postgres',
      host: CONFIG.DB_HOST,
      port: CONFIG.DB_PORT,
      database: CONFIG.DB_NAME,
      username: CONFIG.DB_USER,
      password: CONFIG.DB_PASSWORD,
      logging: CONFIG.DB_LOGGING ? console.log : false,
      pool: {
        max: CONFIG.DB_POOL_MAX,
        min: 0,
        acquire: 30_000,
        idle: 10_000,
      },
    });

    this.models = initializeModels(this.connection);
  }

  async authenticate(): Promise<void> {
    await this.connection.authenticate();
  }

  /**
   * Выполняет колбэк в транзакции с автоматическими commit и rollback.
   * Если в `options.transaction` передана родительская транзакция,
   * колбэк выполняется во вложенной транзакции.
   */
  async managedTransaction<T>(
    autoCallback: (transaction: Transaction) => PromiseLike<T>,
    options?: TransactionOptions,
  ): Promise<T> {
    if (options !== undefined) {
      return await this.connection.transaction(options, autoCallback);
    }

    return await this.connection.transaction(autoCallback);
  }

  async close(): Promise<void> {
    await this.connection.close();
  }
}

const GLOBAL_DB_MANAGER = new DbManager();

export { GLOBAL_DB_MANAGER };
