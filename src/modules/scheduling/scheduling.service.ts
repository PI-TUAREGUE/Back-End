import mongoose, { Types } from 'mongoose';
import { SchedulingModel, IScheduling } from './scheduling.model';
import { SchedulingStatus } from './scheduling.enum';
import { AppError } from '../../shared/errors/AppError';
import { ISchedulingFilters } from './scheduling.filters';
import { EmployeeModel } from '../employee/employee.model';
import { EmployeeStatus } from '../employee/status.enum';
import { ServiceModel } from '../service/service.model';

import { InvitationService } from '../invitation/invitation.service';

export interface SchedulingDTO {
  client: string;
  plate: string;
  car: string;
  startDate: Date;
  endDate?: Date;
  employee: (string | Types.ObjectId)[];
  service: (string | Types.ObjectId)[];
  status: SchedulingStatus;
}

export class SchedulingService {
  constructor(private invitationService: InvitationService) {}

  async create(data: SchedulingDTO, senderId: string): Promise<IScheduling> {
    if (data.endDate && new Date(data.endDate) <= data.startDate) {
      throw new AppError(
        'A data de término deve ser posterior à data de início.',
        404,
      );
    }

    const employeeIds = [
      ...new Set([
        ...data.employee.map((id) => id.toString()),
        senderId.toString(),
      ]),
    ];
    const serviceIds = [...new Set(data.service.map((id) => id.toString()))];

    if (employeeIds.length === 0) {
      throw new AppError('Informe ao menos um mecânico.', 400);
    }

    if (serviceIds.length === 0) {
      throw new AppError('Informe ao menos um serviço.', 400);
    }

    const [employees, serviceCount] = await Promise.all([
      EmployeeModel.find({
        _id: { $in: employeeIds },
        status: EmployeeStatus.ACTIVE,
      }),
      ServiceModel.countDocuments({ _id: { $in: serviceIds } }),
    ]);

    if (employees.length !== employeeIds.length) {
      throw new AppError(
        'Um ou mais mecânicos informados não foram encontrados e/ou estão Inativos',
        404,
      );
    }

    if (serviceCount !== serviceIds.length) {
      throw new AppError(
        'Um ou mais serviços informados não foram encontrados.',
        404,
      );
    }

    const session = await mongoose.startSession();

    let createdScheduling: IScheduling;

    try {
      await session.withTransaction(async () => {
        const [scheduling] = await SchedulingModel.create(
          [
            {
              ...data,
              employee: employeeIds,
              service: serviceIds,
            },
          ],
          { session },
        );

        const receiverIds = employeeIds.filter((id) => id !== senderId);

        if (receiverIds.length > 0) {
          await this.invitationService.create(
            {
              scheduling: scheduling._id.toString(),
              senderId: senderId,
              employeesIds: receiverIds,
            },
            session,
          );
        }

        createdScheduling = scheduling;
      });
    } catch (error) {
      console.error('ERRO REAL DA TRANSAÇÃO:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(
        'Falha ao criar o agendamento e enviar convites.',
        500,
      );
    } finally {
      await session.endSession();
    }

    return createdScheduling!;
  }

  async findById(id: string): Promise<IScheduling | null> {
    const scheduling = await SchedulingModel.findById(id)
      .populate('employee', 'name')
      .populate('service', 'name');

    if (!scheduling) {
      throw new AppError('Agendamento não encontrado', 404);
    }

    return scheduling;
  }

  async findAll(filters: ISchedulingFilters): Promise<SchedulingDTO[]> {
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

    return await SchedulingModel.find(query)
      .populate('employee', 'name')
      .populate('service', 'name');
  }

  async updateStatus(
    id: string,
    status: SchedulingStatus,
  ): Promise<IScheduling | null> {
    const updateScheduling = await SchedulingModel.findByIdAndUpdate(
      id,
      { $set: { status: status } },
      {
        new: true,
        runValidators: true,
      },
    ).exec();

    if (!updateScheduling) {
      throw new AppError('Agendamento não encontrado', 404);
    }

    return updateScheduling;
  }
}
