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
authRouter.post('/login', authController.login);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset
 *     description: Sends a password-reset link to the employee's email when an account exists. The link expires after one hour; the response does not disclose whether the email is registered.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mechanic@example.com
 *     responses:
 *       '200':
 *         description: Request processed. No response body is returned.
 *       '500':
 *         description: Password-reset email could not be sent or server configuration is missing.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post('/forgot-password', authController.forgotPassword);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset an employee password
 *     description: Updates the password using a valid, unexpired password-reset token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password-reset token received through email.
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: newSecret123
 *     responses:
 *       '200':
 *         description: Password reset successful. No response body is returned.
 *       '400':
 *         description: Token is invalid, expired, or not valid for password reset.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Employee associated with the token was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Password-reset server configuration or internal error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post('/reset-password', authController.resetPassword);

export default authRouter;
