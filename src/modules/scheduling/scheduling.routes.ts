import { Router } from 'express';

import { SchedulingService } from './scheduling.service';
import { SchedulingController } from './scheduling.controller';

import { authenticationMiddleware } from '../../shared/middlewares/authentication.middleware';
import { authorizeRoleMiddleware } from '../../shared/middlewares/authorize.middleware';
import { InvitationService } from '../invitation/invitation.service';

const schedulingRouter = Router();

const invitationService = new InvitationService();

const schedulingService = new SchedulingService(invitationService);
const schedulingController = new SchedulingController(schedulingService);

/**
 * @openapi
 * /schedulings:
 *   post:
 *     tags: [Scheduling]
 *     summary: Create a scheduling
 *     security:
 *       - bearerAuth: []
 *     description: Requires the Mechanic role. The authenticated employee is included as an assigned employee.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SchedulingCreate'
 *     responses:
 *       '201':
 *         description: Scheduling created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Scheduling'
 *       '400':
 *         description: Required employee or service was not provided.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *       '404':
 *         description: A referenced employee/service was not found or the date range is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
schedulingRouter.post(
  '/',
  authenticationMiddleware,
  authorizeRoleMiddleware('Mecânico'),
  schedulingController.create,
);
/**
 * @openapi
 * /schedulings:
 *   get:
 *     tags: [Scheduling]
 *     summary: List schedulings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Agendado, Atrasado, Concluído, Cancelado, Em progresso]
 *       - in: query
 *         name: client
 *         schema:
 *           type: string
 *         description: Case-insensitive partial client-name match.
 *     responses:
 *       '200':
 *         description: Schedulings matching the filters.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Scheduling'
 *       '401':
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
schedulingRouter.get(
  '/',
  authenticationMiddleware,
  schedulingController.findAll,
);
/**
 * @openapi
 * /schedulings/{id}/status:
 *   patch:
 *     tags: [Scheduling]
 *     summary: Update a scheduling's status
 *     security:
 *       - bearerAuth: []
 *     description: Requires the Mechanic role.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Scheduling MongoDB ID.
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
 *                 enum: [Agendado, Atrasado, Concluído, Cancelado, Em progresso]
 *     responses:
 *       '200':
 *         description: Updated scheduling.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Scheduling'
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
 *       '404':
 *         description: Scheduling not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
schedulingRouter.patch(
  '/:id/status',
  authenticationMiddleware,
  authorizeRoleMiddleware('Mecânico'),
  schedulingController.updateStatus,
);
/**
 * @openapi
 * /schedulings/{id}:
 *   get:
 *     tags: [Scheduling]
 *     summary: Get a scheduling by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Scheduling MongoDB ID.
 *     responses:
 *       '200':
 *         description: Scheduling details with employee and service names populated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Scheduling'
 *       '401':
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Scheduling not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
schedulingRouter.get(
  '/:id',
  authenticationMiddleware,
  schedulingController.findById,
);

export default schedulingRouter;
