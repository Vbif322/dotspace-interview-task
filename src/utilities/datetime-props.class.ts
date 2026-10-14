import { QueryTypes } from 'sequelize';
import type { Transaction } from 'sequelize';

import { GLOBAL_DB_MANAGER } from '#scripts/db.script.js';

/**
 * Работа с датой и временем.
 * Текущее время берётся из БД, чтобы не зависеть от часов сервера приложения.
 */
class DateTimePropsClass {
  async now(transaction?: Transaction): Promise<Date> {
    const [row] = await GLOBAL_DB_MANAGER.connection.query<{ now: Date }>(
      'SELECT NOW() AS now',
      { type: QueryTypes.SELECT, transaction },
    );

    return row.now;
  }

  toISO(date: Date): string {
    return date.toISOString();
  }
}

const DateTimeProps = new DateTimePropsClass();

export { DateTimeProps };
