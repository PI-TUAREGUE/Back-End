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
}
