import { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';

import { UserPayload } from '../types/express';
import { AppError } from '../errors/AppError';

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new AppError('JWT Secret não foi provido.', 500);
}

export const authenticationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    throw new AppError('Token não foi provido.', 500);
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Formato de token inválido. Use: Bearer <token>');
  }

  try {
    const decoded = jwt.verify(token, secret) as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Sessão expirada. Faça login novamente.', 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Token inválido. Faça login novamente.', 401);
    }
    next(error);
  }
};
