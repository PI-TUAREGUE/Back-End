import { Request, Response, NextFunction } from 'express';
import { InvitationService } from './invitation.service';

export class InvitationController {
  constructor(private invitationService: InvitationService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const senderId = String(req.user?.id);
      const { schedulingId, receiverId } = req.body;

      const invitation = await this.invitationService.create(
        senderId,
        schedulingId,
        receiverId,
      );
      return res.status(201).json(invitation);
    } catch (error) {
      next(error);
    }
  };
}
