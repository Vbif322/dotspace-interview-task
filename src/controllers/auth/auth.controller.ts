import type { Request, Response } from 'express';
import { z } from 'zod';

import { ServiceAuth } from '#services/auth/auth.service.js';

import { validateQuery } from '#controllers/common/request.utils.js';

const activateParamsSchema = z.object({
  token: z.string().min(1).max(64),
});

class ControllerAuth {
  /** Активирует аккаунт по токену из письма. */
  async activate(req: Request, res: Response): Promise<void> {
    const params = validateQuery(activateParamsSchema, req.params);

    const [userId, tokens] = await ServiceAuth.activate(
      params.token,
      req.get('user-agent') ?? null,
    );

    res.status(200).json({ userId, ...tokens });
  }
}

const controllerInstance = new ControllerAuth();

export { controllerInstance as ControllerAuth };
