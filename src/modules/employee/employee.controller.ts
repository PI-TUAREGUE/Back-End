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

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const foundEmployee = await this.employeeService.findById(String(id));

      return res.status(200).json(foundEmployee);

    } catch(error)  {
      next(error);
    }
  }
}
