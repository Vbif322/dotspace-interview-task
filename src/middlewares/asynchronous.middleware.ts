import type { NextFunction, Request, RequestHandler, Response } from 'express';

type IAsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

/** Передаёт ошибки асинхронного обработчика в обработчик ошибок Express. */
function asynchronousMW(handler: IAsyncHandler): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

export { asynchronousMW };
