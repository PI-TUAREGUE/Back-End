import { Router } from 'express';

import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { authenticationMiddleware } from '../../shared/middlewares/authentication.middleware';
import { authorizeRoleMiddleware } from '../../shared/middlewares/authorize.middleware';
import { uploadMiddleware } from '../../shared/middlewares/upload.middleware';

const employeeRouter = Router();

const employeeService = new EmployeeService();
const employeeController = new EmployeeController(employeeService);

/**
 * @openapi
 * /employees:
 *   post:
 *     tags: [Employee]
 *     summary: Create an employee
 *     security:
 *       - bearerAuth: []
 *     description: Requires the Administrator role.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeCreate'
 *     responses:
 *       '201':
 *         description: Employee created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
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
 *         description: An employee with this CPF already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
employeeRouter.post(
  '/',
  authenticationMiddleware,
  authorizeRoleMiddleware('Administrador'),
  uploadMiddleware,
  employeeController.create,
);
/**
 * @openapi
 * /employees:
 *   get:
 *     tags: [Employee]
 *     summary: List employees
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Ativo, Inativo]
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [Administrador, Mecânico]
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Case-insensitive partial name match.
 *     responses:
 *       '200':
 *         description: Employees matching the filters.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Employee'
 *       '401':
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
employeeRouter.get('/', authenticationMiddleware, employeeController.findAll);
/**
 * @openapi
 * /employees/{id}/roles:
 *   patch:
 *     tags: [Employee]
 *     summary: Add a role to an employee
 *     security:
 *       - bearerAuth: []
 *     description: Requires the Administrator role.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee MongoDB ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [Administrador, Mecânico]
 *     responses:
 *       '200':
 *         description: Updated employee.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
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
 *         description: Employee not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
employeeRouter.patch(
  '/:id/roles',
  authenticationMiddleware,
  authorizeRoleMiddleware('Administrador'),
  employeeController.addRole,
);
/**
 * @openapi
 * /employees/{id}/roles:
 *   delete:
 *     tags: [Employee]
 *     summary: Remove a role from an employee
 *     security:
 *       - bearerAuth: []
 *     description: Requires the Administrator role.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee MongoDB ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roles]
 *             properties:
 *               roles:
 *                 type: string
 *                 enum: [Administrador, Mecânico]
 *     responses:
 *       '200':
 *         description: Updated employee.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
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
 *         description: Employee not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
employeeRouter.delete(
  '/:id/roles',
  authenticationMiddleware,
  authorizeRoleMiddleware('Administrador'),
  employeeController.removeRole,
);
/**
 * @openapi
 * /employees/{id}/status:
 *   patch:
 *     tags: [Employee]
 *     summary: Update an employee's status
 *     security:
 *       - bearerAuth: []
 *     description: Requires the Administrator role.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee MongoDB ID.
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
 *         description: Updated employee.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
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
 *         description: Employee not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
employeeRouter.patch(
  '/:id/status',
  authenticationMiddleware,
  authorizeRoleMiddleware('Administrador'),
  employeeController.updateStatus,
);
/**
 * @openapi
 * /employees/{id}:
 *   get:
 *     tags: [Employee]
 *     summary: Get an employee by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee MongoDB ID.
 *     responses:
 *       '200':
 *         description: Employee details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       '401':
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Employee not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
employeeRouter.get(
  '/:id',
  authenticationMiddleware,
  employeeController.findById,
);

export default employeeRouter;
