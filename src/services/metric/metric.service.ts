import { setTimeout as sleep } from 'timers/promises';

import { CONFIG } from '#utilities/config.js';

/**
 * Клиент внешнего сервиса продуктовых метрик.
 * В тестовом окружении сетевой вызов эмулируется задержкой.
 */
class ServiceMetric {
  /** Отправляет событие. Ошибки отправки не пробрасываются. */
  async send(event: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await sleep(CONFIG.METRIC_LATENCY_MS);

      if (CONFIG.DB_LOGGING) {
        console.log(`[metric] ${event}`, payload);
      }
    } catch (error) {
      console.error(`[metric] не удалось отправить ${event}`, error);
    }
  }
}

const serviceInstance = new ServiceMetric();

export { serviceInstance as ServiceMetric };
