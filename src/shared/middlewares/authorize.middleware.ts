import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new AppError('JWT Secret não foi provido', 500);
}

export const authorizeRoleMiddleware = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      throw new AppError('Usuário não possui acesso', 403);
    }

    return next();
  };
};
