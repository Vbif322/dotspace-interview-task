import { ErrorApp } from './error-app.class.js';
import type { IErrorAppDetails } from './error-app.class.js';

type IErrorFactory = (details?: IErrorAppDetails, cause?: unknown) => ErrorApp;

function factory(
  status: number,
  code: string,
  defaultMessage: string,
): IErrorFactory {
  return (details, cause) =>
    new ErrorApp(status, code, defaultMessage, details, cause);
}

/** Фабрики ошибок приложения, сгруппированные по предметным областям. */
const ErrorExtended = {
  App: {
    DB: {
      FailedCRUD: factory(500, 'DB_FAILED_CRUD', 'Ошибка при работе с БД'),
      NotFoundRecord: factory(404, 'DB_NOT_FOUND', 'Запись не найдена'),
      AlreadyExists: factory(409, 'DB_ALREADY_EXISTS', 'Запись уже существует'),
      VersionConflict: factory(
        409,
        'DB_VERSION_CONFLICT',
        'Версия записи устарела',
      ),
    },
    Request: {
      Query: {
        InvalidParameter: factory(
          400,
          'REQUEST_QUERY_INVALID',
          'Некорректные query-параметры',
        ),
      },
      Body: {
        InvalidParameter: factory(
          400,
          'REQUEST_BODY_INVALID',
          'Некорректное тело запроса',
        ),
      },
    },
    Entity: {
      User: {
        Blocked: factory(403, 'USER_BLOCKED', 'Пользователь заблокирован'),
      },
      Confirmation: {
        Expired: factory(410, 'CONFIRMATION_EXPIRED', 'Срок действия истёк'),
      },
    },
  },
  Response: {
    Client: {
      BadRequest: factory(400, 'BAD_REQUEST', 'Некорректный запрос'),
      Unauthorized: factory(401, 'UNAUTHORIZED', 'Требуется авторизация'),
      Forbidden: factory(403, 'FORBIDDEN', 'Недостаточно прав'),
    },
  },
};

export { ErrorApp } from './error-app.class.js';
export { ErrorExtended };
export type { IErrorAppDetails, IErrorAppField } from './error-app.class.js';
