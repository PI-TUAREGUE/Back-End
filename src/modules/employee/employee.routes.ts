import { Router } from 'express';

import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';

const employeeRouter = Router();

const employeeService = new EmployeeService();
const employeeController = new EmployeeController(employeeService);

employeeRouter.post('/', employeeController.create);

export default employeeRouter;
