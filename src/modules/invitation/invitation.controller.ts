import { Request, Response, NextFunction } from 'express';
import { InvitationService } from './invitation.service';
import { InvitationStatus } from './status.enum';

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

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const invitation = await this.invitationService.findById(String(id));
      return res.status(201).json(invitation);
    } catch (error) {
      next(error);
    }
  };

  findByEmployeeId = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const empId = req.user?.id;
      const { status, date } = req.query;

      const invitation = await this.invitationService.findByEmployeeId(
        String(empId),
        {
          status: status as InvitationStatus,
          date: date ? new Date() : undefined,
        },
      );
      return res.status(201).json(invitation);
    } catch (error) {
      next(error);
    }
  };

  respondToInvitation = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const empId = req.user?.id;
      const { status } = req.body;

      const invitation = await this.invitationService.respondToInvitation(
        String(id),
        String(empId),
        status,
      );
      return res.status(201).json(invitation);
    } catch (error) {
      next(error);
    }
  };
}
