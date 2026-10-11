import { Router } from 'express';

import { SchedulerService } from './scheduler.service';
import { SchedulerController } from './scheduler.controller';

const schedulerRouter = Router();

const schedulerService = new SchedulerService();
const schedulerController = new SchedulerController(schedulerService);

schedulerRouter.post('/', schedulerController.create);
schedulerRouter.get('/', schedulerController.findAll);
schedulerRouter.patch('/:id', schedulerController.updateStatus);
schedulerRouter.get('/:id', schedulerController.findById);

export default schedulerRouter;
