import { Router } from 'express';

import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';

const employeeRouter = Router();

const employeeService = new EmployeeService();
const employeeController = new EmployeeController(employeeService);

employeeRouter.post('/', employeeController.create);
employeeRouter.get('/', employeeController.findAll);
employeeRouter.patch('/:id/roles', employeeController.addRole);
employeeRouter.delete('/:id/roles', employeeController.removeRole);
employeeRouter.patch('/:id/status', employeeController.updateStatus);
employeeRouter.get('/:id', employeeController.findById);

export default employeeRouter;
