import type { IAccessTokenPayload } from '#services/auth/token.service.js';

declare module 'express-serve-static-core' {
  interface Request {
    /** Полезная нагрузка access-токена авторизованного пользователя. */
    token?: IAccessTokenPayload;
  }
}
