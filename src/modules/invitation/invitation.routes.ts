import { Router } from 'express';

import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';

import { authenticationMiddleware } from '../../shared/middlewares/authentication.middleware';
import { authorizeRoleMiddleware } from '../../shared/middlewares/authorize.middleware';

const invitationRouter = Router();

const invitationService = new InvitationService();
const invitationController = new InvitationController(invitationService);

/**
 * @openapi
 * /invitations:
 *   post:
 *     tags: [Invitation]
 *     summary: Send scheduling invitations
 *     security:
 *       - bearerAuth: []
 *     description: Requires the Mechanic role. The authenticated employee is the sender.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InvitationCreate'
 *     responses:
 *       '201':
 *         description: Invitations created for the selected employees.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invitation'
 *       '401':
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Mechanic role required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
invitationRouter.post(
  '/',
  authenticationMiddleware,
  authorizeRoleMiddleware('Mecânico'),
  invitationController.create,
);

/**
 * @openapi
 * /invitations/{id}:
 *   get:
 *     tags: [Invitation]
 *     summary: Get an invitation by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation MongoDB ID.
 *     responses:
 *       '201':
 *         description: Invitation details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invitation'
 *       '401':
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Invitation not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
invitationRouter.get(
  '/:id',
  authenticationMiddleware,
  invitationController.findById,
);

/**
 * @openapi
 * /invitations:
 *   get:
 *     tags: [Invitation]
 *     summary: List invitations received by the current employee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pendente, Aceito, Recusado, Cancelado]
 *     responses:
 *       '201':
 *         description: Invitations matching the status filter.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invitation'
 *       '401':
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
invitationRouter.get(
  '/',
  authenticationMiddleware,
  invitationController.findByEmployeeId,
);

/**
 * @openapi
 * /invitations/{id}:
 *   patch:
 *     tags: [Invitation]
 *     summary: Respond to an invitation
 *     security:
 *       - bearerAuth: []
 *     description: Accepting an invitation adds the current employee to the scheduling.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation MongoDB ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Aceito, Recusado]
 *     responses:
 *       '201':
 *         description: Invitation response recorded.
 *       '401':
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Invitation not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
invitationRouter.patch(
  '/:id',
  authenticationMiddleware,
  invitationController.respondToInvitation,
);

export default invitationRouter;
