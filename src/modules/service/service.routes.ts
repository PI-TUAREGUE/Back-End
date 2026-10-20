import { Router } from 'express';

import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';

import { authenticationMiddleware } from '../../shared/middlewares/authentication.middleware';
import { authorizeRoleMiddleware } from '../../shared/middlewares/authorize.middleware';

const serviceRouter = Router();

const serviceService = new ServiceService();
const serviceController = new ServiceController(serviceService);

/**
 * @openapi
 * /services:
 *   post:
 *     tags: [Service]
 *     summary: Create a service
 *     security:
 *       - bearerAuth: []
 *     description: Requires the Administrator role.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceCreate'
 *     responses:
 *       '201':
 *         description: Service created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       '401':
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Administrator role required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '409':
 *         description: A service with this name already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
serviceRouter.post(
  '/',
  authenticationMiddleware,
  authorizeRoleMiddleware('Administrador'),
  serviceController.create,
);
/**
 * @openapi
 * /services:
 *   get:
 *     tags: [Service]
 *     summary: List services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Ativo, Inativo]
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Case-insensitive partial name match.
 *     responses:
 *       '200':
 *         description: Services matching the filters.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 *       '401':
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
serviceRouter.get('/', authenticationMiddleware, serviceController.findAll);
/**
 * @openapi
 * /services/{id}/status:
 *   patch:
 *     tags: [Service]
 *     summary: Update a service's status
 *     security:
 *       - bearerAuth: []
 *     description: Requires the Administrator role.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service MongoDB ID.
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
 *                 enum: [Ativo, Inativo]
 *     responses:
 *       '200':
 *         description: Updated service.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       '401':
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Administrator role required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Service not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
serviceRouter.patch(
  '/:id/status',
  authenticationMiddleware,
  authorizeRoleMiddleware('Administrador'),
  serviceController.updateStatus,
);
/**
 * @openapi
 * /services/{id}:
 *   get:
 *     tags: [Service]
 *     summary: Get a service by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service MongoDB ID.
 *     responses:
 *       '200':
 *         description: Service details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       '401':
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Service not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
serviceRouter.get('/:id', authenticationMiddleware, serviceController.findById);

export default serviceRouter;
