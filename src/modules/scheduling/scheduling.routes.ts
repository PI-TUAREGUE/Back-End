import { Router } from 'express';

import { SchedulingService } from './scheduling.service';
import { SchedulingController } from './scheduling.controller';

const schedulingRouter = Router();

const schedulingService = new SchedulingService();
const schedulingController = new SchedulingController(schedulingService);

schedulingRouter.post('/', schedulingController.create);
schedulingRouter.get('/', schedulingController.findAll);
schedulingRouter.patch('/:id', schedulingController.updateStatus);
schedulingRouter.get('/:id', schedulingController.findById);

export default schedulingRouter;
