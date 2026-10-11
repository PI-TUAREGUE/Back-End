import { Types } from 'mongoose';
import { SchedulerModel, IScheduler } from './scheduler.model';
import { SchedulerStatus } from './scheduler.enum';
import { AppError } from '../../shared/errors/AppError';
import { ISchedulerFilters } from './scheduler.filters';
import { EmployeeModel } from '../employee/employee.model';
import { ServiceModel } from '../service/service.model';

export interface SchedulerDTO {
  client: string;
  plate: string;
  car: string;
  startDate: Date;
  endDate?: Date;
  employee: (string | Types.ObjectId)[];
  service: (string | Types.ObjectId)[];
  status: SchedulerStatus;
}

export class SchedulerService {
  async create(data: SchedulerDTO): Promise<IScheduler> {
    const startDate = new Date(data.startDate);

    if (data.endDate && new Date(data.endDate) <= startDate) {
      throw new AppError(
        'A data de término deve ser posterior à data de início.',
        404,
      );
    }

    const employeeIds = [...new Set(data.employee.map((id) => id.toString()))];
    const serviceIds = [...new Set(data.service.map((id) => id.toString()))];

    if (employeeIds.length === 0) {
      throw new AppError('Informe ao menos um mecânico.', 400);
    }

    if (serviceIds.length === 0) {
      throw new AppError('Informe ao menos um serviço.', 400);
    }

    const [employeeCount, serviceCount] = await Promise.all([
      EmployeeModel.countDocuments({ _id: { $in: employeeIds } }),
      ServiceModel.countDocuments({ _id: { $in: serviceIds } }),
    ]);

    if (employeeCount !== employeeIds.length) {
      throw new AppError(
        'Um ou mais mecânicos informados não foram encontrados.',
        404,
      );
    }

    if (serviceCount !== serviceIds.length) {
      throw new AppError(
        'Um ou mais serviços informados não foram encontrados.',
        404,
      );
    }

    return await SchedulerModel.create({
      ...data,
      startDate,
      employee: employeeIds,
      service: serviceIds,
    });
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
