import { Router } from 'express';

import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';

const serviceRouter = Router();

const serviceService = new ServiceService();
const serviceController = new ServiceController(serviceService);

serviceRouter.post('/', serviceController.create);
serviceRouter.get('/', serviceController.findAll);
serviceRouter.patch('/:id/status', serviceController.updateStatus);
serviceRouter.get('/:id', serviceController.findById);

export default serviceRouter;
