import { SchedulerModel, IScheduler } from './scheduler.model';

import { SchedulerStatus } from './scheduler.enum';
import { AppError } from '../../shared/errors/AppError';
import { ISchedulerFilters } from './scheduler.filters';

export type SchedulerDTO = Omit<IScheduler, '_id' | 'createdAt' | 'updatedAt'>;

export class SchedulerService {
  async create(data: SchedulerDTO): Promise<IScheduler> {
    return await SchedulerModel.create(data);
  }

  async findById(id: string): Promise<IScheduler | null> {
    const scheduler = await SchedulerModel.findById(id).exec();

    if (!scheduler) {
      throw new AppError('Agendamento não encontrado', 404);
    }

    return scheduler;
  }

  async findAll(filters: ISchedulerFilters): Promise<SchedulerDTO[]> {
    const query: Record<string, any> = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.client) {
      query.client = { $regex: filters.client, $options: 'i' };
    }

    if (filters.car) {
      query.car = { $regex: filters.car, $options: 'i' };
    }

    if (filters.plate) {
      query.plate = { $regex: filters.plate.toUpperCase(), $options: 'i' };
    }

    return await SchedulerModel.find(query).exec();
  }

  async updateStatus(
    id: string,
    status: SchedulerStatus,
  ): Promise<IScheduler | null> {
    const updateScheduler = await SchedulerModel.findByIdAndUpdate(
      id,
      { $set: { status: status } },
      {
        new: true,
        runValidators: true,
      },
    ).exec();

    if (!updateScheduler) {
      throw new AppError('Agendamento não encontrado', 404);
    }

    return updateScheduler;
  }
}
