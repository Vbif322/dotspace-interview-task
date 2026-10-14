import type { NextFunction, Request, Response } from 'express';

import { ErrorApp } from '#utilities/exceptions/index.js';

/** Преобразует ошибку в HTTP-ответ. */
function errorMW(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ErrorApp) {
    if (error.status >= 500) {
      console.error(error, error.cause);
    }

    res.status(error.status).json({
      code: error.code,
      message: error.message,
      fields: error.fields,
    });
    return;
  }

  console.error(error);

  res.status(500).json({ code: 'INTERNAL', message: 'Внутренняя ошибка' });
}

export { errorMW };
