import type { Request, Response } from 'express';

import { ServiceCanvasParticipant } from '#services/canvas/canvas-participant.service.js';

import type { ECanvasParticipantRole } from '#models/index.js';

import { requireToken } from '#controllers/common/request.utils.js';

class ControllerCanvasParticipant {
  /** Список участников холста. */
  async receiveMany(req: Request, res: Response): Promise<void> {
    const token = requireToken(req.token);

    const canvasId = Number(req.query.canvas_id);
    const role = req.query.role as ECanvasParticipantRole | undefined;

    // limits
    const offset = req.query.offset ? Number(req.query.offset) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const participants = await ServiceCanvasParticipant.receiveMany(
      { canvasId, role },
      { offset, limit },
      { actorId: token.id },
    );

    res.status(200).json(participants);
  }
}

const controllerInstance = new ControllerCanvasParticipant();

export { controllerInstance as ControllerCanvasParticipant };
