import type { z } from 'zod';

import { ErrorExtended } from '#utilities/exceptions/index.js';
import type { IErrorAppField } from '#utilities/exceptions/index.js';

function errorFields(issues: z.core.$ZodIssue[]): IErrorAppField[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    comment: issue.message,
  }));
}

/** Валидирует query-параметры контроллера. */
function validateQuery<T>(schema: z.ZodType<T>, query: unknown): T {
  const result = schema.safeParse(query);

  if (!result.success) {
    throw ErrorExtended.App.Request.Query.InvalidParameter({
      fields: errorFields(result.error.issues),
    });
  }

  return result.data;
}

/** Валидирует тело запроса контроллера. */
function validateBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);

  if (!result.success) {
    throw ErrorExtended.App.Request.Body.InvalidParameter({
      fields: errorFields(result.error.issues),
    });
  }

  return result.data;
}

/** Возвращает полезную нагрузку токена или бросает 401. */
function requireToken<T>(token: T | undefined): T {
  if (token === undefined) {
    throw ErrorExtended.Response.Client.Unauthorized();
  }

  return token;
}

export { requireToken, validateBody, validateQuery };
