import { Router } from 'express';

import { SchedulingService } from './scheduling.service';
import { SchedulingController } from './scheduling.controller';

import { authenticationMiddleware } from '../../shared/middlewares/authentication.middleware';
import { authorizeRoleMiddleware } from '../../shared/middlewares/authorize.middleware';

const schedulingRouter = Router();

const schedulingService = new SchedulingService();
const schedulingController = new SchedulingController(schedulingService);

schedulingRouter.post(
  '/',
  authenticationMiddleware,
  authorizeRoleMiddleware('Mecânico'),
  schedulingController.create,
);
schedulingRouter.get(
  '/',
  authenticationMiddleware,
  schedulingController.findAll,
);
schedulingRouter.patch(
  '/:id',
  authenticationMiddleware,
  authorizeRoleMiddleware('Mecânico'),
  schedulingController.updateStatus,
);
schedulingRouter.get(
  '/:id',
  authenticationMiddleware,
  schedulingController.findById,
);

export default schedulingRouter;
