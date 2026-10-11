import { Router } from 'express';

import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { authenticationMiddleware } from '../../shared/middlewares/authentication.middleware';
import { authorizeRoleMiddleware } from '../../shared/middlewares/authorize.middleware';

const employeeRouter = Router();

const employeeService = new EmployeeService();
const employeeController = new EmployeeController(employeeService);

employeeRouter.post(
  '/',
  authenticationMiddleware,
  authorizeRoleMiddleware('Administrador'),
  employeeController.create,
);
employeeRouter.get('/', authenticationMiddleware, employeeController.findAll);
employeeRouter.patch(
  '/:id/roles',
  authenticationMiddleware,
  authorizeRoleMiddleware('Administrador'),
  employeeController.addRole,
);
employeeRouter.delete(
  '/:id/roles',
  authenticationMiddleware,
  authorizeRoleMiddleware('Administrador'),
  employeeController.removeRole,
);
employeeRouter.patch(
  '/:id/status',
  authenticationMiddleware,
  authorizeRoleMiddleware('Administrador'),
  employeeController.updateStatus,
);
employeeRouter.get(
  '/:id',
  authenticationMiddleware,
  employeeController.findById,
);

export default employeeRouter;
