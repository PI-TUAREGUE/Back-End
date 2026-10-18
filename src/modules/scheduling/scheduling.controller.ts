import { Request, Response, NextFunction } from 'express';
import { SchedulingService } from './scheduling.service';

export class SchedulingController {
  constructor(private schedulingService: SchedulingService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const senderId = req.user!.id;

      const scheduling = await this.schedulingService.create(
        req.body,
        senderId,
      );
      return res.status(201).json(scheduling);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const scheduling = await this.schedulingService.findById(String(id));
      return res.status(200).json(scheduling);
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        startDate,
        endDate,
        status,
        client,
        plate,
        car,
        service,
        employee,
      } = req.query;

      const scheduling = await this.schedulingService.findAll({
        status: status as any,
        client: client as string,
      });
      return res.status(200).json(scheduling);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const scheduling = await this.schedulingService.updateStatus(
        String(id),
        status,
      );
      return res.status(200).json(scheduling);
    } catch (error) {
      next(error);
    }
  };
}
