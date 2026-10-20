import { Router } from 'express';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

const authRouter = Router();

const authService = new AuthService();
const authController = new AuthController(authService);

/**
 * @openapi
 * /auth:
 *   post:
 *     tags: [Auth]
 *     summary: Log in an employee
 *     description: Authenticates an employee and returns a JWT valid for one hour.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mechanic@example.com
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       '200':
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       '401':
 *         description: Email or password is incorrect.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Server configuration or internal error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post('/', authController.login);

export default authRouter;
