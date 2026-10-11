import { Request, Response, NextFunction } from 'express';
import { SchedulerService } from './scheduler.service';

export class SchedulerController {
  constructor(private schedulerService: SchedulerService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        client,
        plate,
        car,
        startDate,
        endDate,
        employee,
        service,
        status,
      } = req.body;

      const scheduler = await this.schedulerService.create({
        client,
        plate,
        car,
        startDate,
        endDate,
        employee,
        service,
        status,
      });
      return res.status(201).json(scheduler);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const scheduler = await this.schedulerService.findById(String(id));
      return res.status(200).json(scheduler);
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

      const scheduler = await this.schedulerService.findAll({
        status: status as any,
        client: client as string,
      });
      return res.status(200).json(scheduler);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const scheduler = await this.schedulerService.updateStatus(
        String(id),
        status,
      );
      return res.status(200).json(scheduler);
    } catch (error) {
      next(error);
    }
  };
}
