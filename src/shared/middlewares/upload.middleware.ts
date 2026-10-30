import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

import fs from 'fs';

const uploadDir = 'uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const multerUpload = multer({ dest: uploadDir });

export const uploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  multerUpload.single('avatarUrl')(req, res, (err) => {
    if (err) {
      return next(new AppError('Erro ao fazer upload do arquivo', 400));
    }
    next();
  });
};
