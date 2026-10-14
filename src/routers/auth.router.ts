import { Router } from 'express';

import { asynchronousMW } from '#middlewares/asynchronous.middleware.js';

import { ControllerAuth } from '#controllers/auth/auth.controller.js';

const router = Router();

router.post(
  '/activate/:token',
  asynchronousMW(async (req, res) => {
    await ControllerAuth.activate(req, res);
  }),
);

export { router as AuthRouter };
