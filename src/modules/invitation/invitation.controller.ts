import { Request, Response, NextFunction } from 'express';
import { InvitationService } from './invitation.service';

export class InvitationController {
  constructor(private invitationService: InvitationService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const senderId = req.user!.id;
      const { scheduling, employeesIds } = req.body;

      const invitation = await this.invitationService.create({
        scheduling,
        senderId,
        employeesIds,
      });
      return res.status(201).json(invitation);
    } catch (error) {
      next(error);
    }
  };
}
