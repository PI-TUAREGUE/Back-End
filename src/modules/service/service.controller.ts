import { Request, Response, NextFunction } from 'express';
import { ServiceService } from './service.service';

export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = await this.serviceService.create(req.body);
      return res.status(201).json(service);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const service = await this.serviceService.findById(String(id));
      return res.status(200).json(service);
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, name } = req.query;

      const service = await this.serviceService.findAll({
        status: status as any,
        name: name as string,
      });

      return res.status(200).json(service);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const service = await this.serviceService.updateStatus(
        String(id),
        status,
      );
      return res.status(200).json(service);
    } catch (error) {
      next(error);
    }
  };
}
