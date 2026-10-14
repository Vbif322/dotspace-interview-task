import type { NextFunction, Request, Response } from 'express';

import { ErrorExtended } from '#utilities/exceptions/index.js';

import { ServiceToken } from '#services/auth/token.service.js';

/** Проверяет Bearer access-токен и сохраняет его полезную нагрузку в запросе. */
function authMW(req: Request, _res: Response, next: NextFunction): void {
  const header = req.get('authorization');

  if (header === undefined || !header.startsWith('Bearer ')) {
    next(ErrorExtended.Response.Client.Unauthorized());
    return;
  }

  try {
    req.token = ServiceToken.verifyAccessToken(header.slice('Bearer '.length));
    next();
  } catch (error) {
    next(error);
  }
}

export { authMW };
