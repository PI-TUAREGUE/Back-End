import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const token = await this.authService.login(email, password);

      return res.status(200).json(token);
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      const token = await this.authService.forgotPassword(email);

      return res.status(200).json(token);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;

      const recoveredPassword = await this.authService.resetPassword(
        token,
        newPassword,
      );

      return res.status(200).json(recoveredPassword);
    } catch (error) {
      next(error);
    }
  };
}
