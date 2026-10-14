import 'dotenv/config';
import { z } from 'zod';

const configSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive(),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_POOL_MAX: z.coerce.number().int().positive().default(5),
  DB_LOGGING: z.stringbool().default(false),

  JWT_SECRET: z.string().min(1),
  JWT_ACCESS_TTL: z.string().min(1).default('1h'),
  JWT_REFRESH_TTL: z.string().min(1).default('30d'),

  METRIC_LATENCY_MS: z.coerce.number().int().nonnegative().default(300),
});

type IConfig = z.infer<typeof configSchema>;

/** Конфигурация приложения из переменных окружения. */
const CONFIG: IConfig = configSchema.parse(process.env);

export { CONFIG };
export type { IConfig };
