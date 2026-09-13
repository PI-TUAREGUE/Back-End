import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from './employee.service';

export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const employee = await this.employeeService.create(req.body);
      return res.status(201).json(employee);
    } catch (error) {
      next(error);
    }
  };
}
