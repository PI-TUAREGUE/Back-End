import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from './employee.service';

export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const avatarUrl = req.file
        ? req.file.path.replace(/\\/g, '/')
        : undefined;

      const employee = await this.employeeService.create({
        ...req.body,
        avatarUrl,
      });
      return res.status(201).json(employee);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const employee = await this.employeeService.findById(String(id));
      return res.status(200).json(employee);
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, role, name } = req.query;

      const employee = await this.employeeService.findAll({
        status: status as any,
        role: role as any,
        name: name as string,
      });
      return res.status(200).json(employee);
    } catch (error) {
      next(error);
    }
  };

  addRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const employee = await this.employeeService.addRole(String(id), role);
      return res.status(200).json(employee);
    } catch (error) {
      next(error);
    }
  };

  removeRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { roles } = req.body;

      const employee = await this.employeeService.removeRole(String(id), roles);
      return res.status(200).json(employee);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const employee = await this.employeeService.updateStatus(
        String(id),
        status,
      );
      return res.status(200).json(employee);
    } catch (error) {
      next(error);
    }
  };
}
