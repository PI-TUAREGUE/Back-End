import { Router } from 'express';

import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';

import { authenticationMiddleware } from '../../shared/middlewares/authentication.middleware';
import { authorizeRoleMiddleware } from '../../shared/middlewares/authorize.middleware';

const serviceRouter = Router();

const serviceService = new ServiceService();
const serviceController = new ServiceController(serviceService);

serviceRouter.post(
  '/',
  authenticationMiddleware,
  authorizeRoleMiddleware('Administrador'),
  serviceController.create,
);
serviceRouter.get('/', authenticationMiddleware, serviceController.findAll);
serviceRouter.patch(
  '/:id/status',
  authenticationMiddleware,
  authorizeRoleMiddleware('Administrador'),
  serviceController.updateStatus,
);
serviceRouter.get('/:id', authenticationMiddleware, serviceController.findById);

export default serviceRouter;
