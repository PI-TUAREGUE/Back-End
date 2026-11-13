import { Request, Response, NextFunction } from 'express';
import { SchedulingModel } from '../scheduling.model';
import { AppError } from '../../../shared/errors/AppError';

export const validateEditPermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const schedulingId = req.params.schedulingId;
    const userId = req.user?.id;

    if (!schedulingId || !userId) {
      throw new AppError('Agendamento ou usuário não encontrado.', 404);
    }

    const scheduling = await SchedulingModel.findById(schedulingId);

    if (!scheduling) {
      throw new AppError('Agendamento não encontrado.', 404);
    }

    const isEditor = scheduling.editors.some(
      (editorId) => editorId.toString() === userId.toString(),
    );

    if (!isEditor) {
      throw new AppError(
        'Você não tem permissão para editar este agendamento',
        403,
      );
    }

    return next();
  } catch (error) {
    next(error);
  }
};
