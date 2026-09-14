import { Router } from 'express';

import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';

const employeeRouter = Router();

const employeeService = new EmployeeService();
const employeeController = new EmployeeController(employeeService);

employeeRouter.post('/', employeeController.create);
employeeRouter.get('/', employeeController.findAll);
employeeRouter.get('/:id', employeeController.findById);
employeeRouter.patch('/roles/:id', employeeController.addRole);
employeeRouter.patch('/status/:id', employeeController.updateStatus);

export default employeeRouter;
