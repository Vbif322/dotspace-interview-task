import { Router } from 'express';

import { AuthRouter } from './auth.router.js';
import { CanvasRouter } from './canvas.router.js';

const router = Router();

router.use('/auth', AuthRouter);
router.use('/canvas', CanvasRouter);

export { router as PublicRouter };
