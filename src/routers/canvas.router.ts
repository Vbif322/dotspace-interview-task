import { Router } from 'express';

import { asynchronousMW } from '#middlewares/asynchronous.middleware.js';
import { authMW } from '#middlewares/auth.middleware.js';

import { ControllerCanvasParticipant } from '#controllers/canvas/participant.controller.js';
import { ControllerShape } from '#controllers/canvas/shape.controller.js';

const router = Router();

router.use(authMW);

router.get(
  '/participants',
  asynchronousMW(async (req, res) => {
    await ControllerCanvasParticipant.receiveMany(req, res);
  }),
);

router.get(
  '/shape/snapshot',
  asynchronousMW(async (req, res) => {
    await ControllerShape.receiveSnapshot(req, res);
  }),
);

router.post(
  '/shape/actions',
  asynchronousMW(async (req, res) => {
    await ControllerShape.actions(req, res);
  }),
);

export { router as CanvasRouter };
