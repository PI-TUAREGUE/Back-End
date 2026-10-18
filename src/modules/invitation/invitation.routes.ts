import { Router } from 'express';

import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';

import { authenticationMiddleware } from '../../shared/middlewares/authentication.middleware';
import { authorizeRoleMiddleware } from '../../shared/middlewares/authorize.middleware';

const invitationRouter = Router();

const invitationService = new InvitationService();
const invitationController = new InvitationController(invitationService);

invitationRouter.post(
  '/',
  authenticationMiddleware,
  authorizeRoleMiddleware('Mecânico'),
  invitationController.create,
);

export default invitationRouter;
