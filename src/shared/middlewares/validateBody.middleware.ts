import { Request, Response, NextFunction } from 'express';

import { ZodType, ZodError } from 'zod';

export const validateBody = (schema: ZodType) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 'error',
          message: 'Erro de validação nos dados enviados.',
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }

      res.status(500).json({ message: 'Erro interno no servidor.' });
    }
  };
};
