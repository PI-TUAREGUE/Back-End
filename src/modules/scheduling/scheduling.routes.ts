import { Router } from 'express';

import { SchedulingService } from './scheduling.service';
import { SchedulingController } from './scheduling.controller';

import { authenticationMiddleware } from '../../shared/middlewares/authentication.middleware';
import { authorizeRoleMiddleware } from '../../shared/middlewares/authorize.middleware';
import { validateEditPermission } from './middlewares/validateEditPermission.middleware';

import { validateBody } from '../../shared/middlewares/validateBody.middleware';
import { schedulingSchema } from './scheduling.zod.schema';

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
  validateBody(schedulingSchema),
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
 * /schedulings/{schedulingId}/add-service:
 *   post:
 *     tags: [Scheduling]
 *     summary: Add a service to a scheduling
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schedulingId
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
 *             required: [serviceId]
 *             properties:
 *               serviceId:
 *                 type: string
 *                 description: MongoDB ID of the active service to add.
 *     responses:
 *       '200':
 *         description: Service added. Returns the updated scheduling.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Scheduling'
 *       '400':
 *         description: Service is inactive or is already included in the scheduling.
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
 *       '404':
 *         description: Scheduling or service not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
schedulingRouter.post(
  '/:schedulingId/services',
  authenticationMiddleware,
  authorizeRoleMiddleware('Mecânico', 'Administrador'),
  validateEditPermission,
  schedulingController.addService,
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
  validateEditPermission,
  schedulingController.updateStatus,
);

/**
 * @openapi
 * /schedulings/{id}/startDate:
 *   patch:
 *     tags: [Scheduling]
 *     summary: Update a scheduling's start date
 *     description: Requires the Mechanic role. The new start date must be earlier than the scheduling's end date, if one is set.
 *     security:
 *       - bearerAuth: []
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
 *             required: [startDate]
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: '2025-01-20T09:00:00.000Z'
 *     responses:
 *       '200':
 *         description: Start date updated. Returns the updated scheduling.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Scheduling'
 *       '400':
 *         description: Start date is not earlier than the end date.
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
 *         description: Scheduling not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
schedulingRouter.patch(
  '/:id/startDate',
  authenticationMiddleware,
  authorizeRoleMiddleware('Mecânico'),
  validateEditPermission,
  schedulingController.updateStartDate,
);

/**
 * @openapi
 * /schedulings/{id}/endDate:
 *   patch:
 *     tags: [Scheduling]
 *     summary: Update a scheduling's end date
 *     description: Requires the Mechanic role. The new end date must be later than the scheduling's start date.
 *     security:
 *       - bearerAuth: []
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
 *             required: [endDate]
 *             properties:
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: '2025-01-20T18:00:00.000Z'
 *     responses:
 *       '200':
 *         description: End date updated. Returns the updated scheduling.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Scheduling'
 *       '400':
 *         description: End date is not later than the start date.
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
 *         description: Scheduling not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
schedulingRouter.patch(
  '/:id/endDate',
  authenticationMiddleware,
  authorizeRoleMiddleware('Mecânico'),
  validateEditPermission,
  schedulingController.updateEndDate,
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

/**
 * @openapi
 * /schedulings/{id}/receipt:
 *   get:
 *     tags: [Scheduling]
 *     summary: Download a scheduling receipt
 *     description: Generates a PDF receipt containing the client's name, vehicle details, scheduled end date, and services.
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
 *         description: Scheduling receipt PDF.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
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
  '/:id/receipt',
  authenticationMiddleware,
  schedulingController.generateReceipt,
);

export default schedulingRouter;
