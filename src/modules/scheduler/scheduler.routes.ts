import { Router } from 'express';

import { SchedulerService } from './scheduler.service';
import { SchedulerController } from './scheduler.controller';

const schedulerRouter = Router();

const schedulerService = new SchedulerService();
const schedulerController = new SchedulerController(schedulerService);

schedulerRouter.post('/', schedulerController.create);
schedulerRouter.get('/', schedulerController.findAll);
schedulerRouter.patch('/', schedulerController.updateStatus);
schedulerRouter.get('/', schedulerController.findById);

export default schedulerRouter;