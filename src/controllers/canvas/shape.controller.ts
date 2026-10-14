import type { Request, Response } from 'express';
import { z } from 'zod';

import { ServiceMetric } from '#services/metric/metric.service.js';
import { ServiceShapeHistory } from '#services/canvas/shape-history.service.js';
import {
  EShapeOperation,
  ServiceShapeAction,
} from '#services/canvas/shape-action.service.js';

import {
  requireToken,
  validateBody,
  validateQuery,
} from '#controllers/common/request.utils.js';

const receiveSnapshotQuerySchema = z.object({
  canvas_id: z.coerce.number().int().positive(),
  shape_id: z.string().min(1).optional(),
  date: z.coerce.date(),
});

const actionsBodySchema = z.object({
  canvas_id: z.number().int().positive(),
  actions: z.array(
    z.object({
      operation: z.enum(EShapeOperation),
      shape_id: z.string().min(1).max(64),
      content: z.record(z.string(), z.unknown()).optional(),
      rank: z.number().int().optional(),
      version: z.number().int().positive().optional(),
    }),
  ),
});

class ControllerShape {
  /** Состояние фигур холста на указанный момент времени. */
  async receiveSnapshot(req: Request, res: Response): Promise<void> {
    const token = requireToken(req.token);
    const query = validateQuery(receiveSnapshotQuerySchema, req.query);

    const shapes = await ServiceShapeHistory.receiveSnapshot(
      {
        canvasId: query.canvas_id,
        shapeId: query.shape_id,
        createdAt: query.date,
      },
      { actorId: token.id },
    );

    res.status(200).json(shapes);
  }

  /** Пакетное изменение фигур холста. */
  async actions(req: Request, res: Response): Promise<void> {
    const token = requireToken(req.token);
    const body = validateBody(actionsBodySchema, req.body);

    const result = await ServiceShapeAction.actions(
      {
        canvasId: body.canvas_id,
        actions: body.actions.map((action) => ({
          operation: action.operation,
          shapeId: action.shape_id,
          content: action.content,
          rank: action.rank,
          version: action.version,
        })),
      },
      { actorId: token.id },
    );

    await ServiceMetric.send('canvas.shapes.changed', {
      canvasId: result.canvasId,
      done: result.done.length,
      failed: result.failed.length,
    });

    await ServiceMetric.send('canvas.activity', {
      canvasId: result.canvasId,
      actorId: token.id,
    });

    res.status(200).json(result);
  }
}

const controllerInstance = new ControllerShape();

export { controllerInstance as ControllerShape };
