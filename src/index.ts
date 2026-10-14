import express from 'express';

import { GLOBAL_DB_MANAGER } from '#scripts/db.script.js';
import { CONFIG } from '#utilities/config.js';

import { asynchronousMW } from '#middlewares/asynchronous.middleware.js';
import { errorMW } from '#middlewares/error.middleware.js';
import { PublicRouter } from '#routers/public.router.js';

const app = express();

app.use(express.json({ limit: '5mb' }));

app.get(
  '/health',
  asynchronousMW(async (_req, res) => {
    await GLOBAL_DB_MANAGER.connection.query('SELECT 1');

    res.status(200).json({ status: 'ok' });
  }),
);

app.use('/api', PublicRouter);

app.use(errorMW);

await GLOBAL_DB_MANAGER.authenticate();

app.listen(CONFIG.PORT, () => {
  console.log(`Сервер запущен на http://localhost:${CONFIG.PORT}`);
});
