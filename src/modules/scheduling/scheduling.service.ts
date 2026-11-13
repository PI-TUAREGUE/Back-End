import { AppError } from '../../shared/errors/AppError';

import mongoose, { Types } from 'mongoose';
import { getIO } from '../../shared/config/webSocket';

import { SchedulingModel, IScheduling } from './scheduling.model';
import { SchedulingStatus } from './scheduling.enum';
import { ISchedulingFilters } from './scheduling.filters';

import { EmployeeModel } from '../employee/employee.model';
import { EmployeeStatus } from '../employee/status.enum';

import { ServiceModel } from '../service/service.model';

import { InvitationService } from '../invitation/invitation.service';

export interface SchedulingDTO {
  client: string;
  clientTel: string;
  plate: string;
  car: string;
  startDate: Date;
  endDate?: Date;
  employee: (string | Types.ObjectId)[];
  editors: (string | Types.ObjectId)[];
  invitedEmployees?: (string | Types.ObjectId)[];
  service: (string | Types.ObjectId)[];
  status: SchedulingStatus;
}

interface ReceiptDTO extends Omit<
  SchedulingDTO,
  'startDate' | 'employee' | 'invitedEmployees' | 'status' | 'owner' | 'editors'
> {}

export class SchedulingService {
  constructor(private invitationService: InvitationService) {}

  async create(data: SchedulingDTO, senderId: string): Promise<IScheduling> {
    if (data.endDate && new Date(data.endDate) <= data.startDate) {
      throw new AppError(
        'A data de término deve ser posterior à data de início.',
        400,
      );
    }

    if (!data.service || data.service.length === 0) {
      throw new AppError('A lista de serviços não pode estar vazia', 400);
    }

    const employeeIds = [
      ...new Set([
        ...data.employee.map((id) => id.toString()),
        senderId.toString(),
      ]),
    ];

    if (employeeIds.length === 0) {
      throw new AppError('Informe ao menos um mecânico.', 400);
    }

    const editorIds = [
      ...new Set([...data.editors.map((id) => id.toString())]),
    ];

    if (editorIds.length > 0) {
      const activeEditorsCount = await EmployeeModel.countDocuments({
        _id: { $in: editorIds },
        status: EmployeeStatus.ACTIVE,
      });

      if (activeEditorsCount !== editorIds.length) {
        throw new AppError(
          'Um ou mais mecânicos editores não foram encontrados ou estão inativos.',
          404,
        );
      }
    }

    const invitedIds = [
      ...new Set(
        (data.invitedEmployees || [])
          .map((id) => id.toString())
          .filter((id) => id !== senderId),
      ),
    ];

    if (invitedIds.length > 0) {
      const activeEmployeesCount = await EmployeeModel.countDocuments({
        _id: { $in: invitedIds },
        status: EmployeeStatus.ACTIVE,
      });

      if (activeEmployeesCount !== invitedIds.length) {
        throw new AppError(
          'Um ou mais mecânicos convidados não foram encontrados ou estão inativos.',
          404,
        );
      }
    }

    const serviceIds = [...new Set(data.service.map((id) => id.toString()))];

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
              owner: senderId,
              service: serviceIds,
              editors: [senderId, ...editorIds],
            },
          ],
          { session },
        );

        if (invitedIds.length > 0) {
          const invitations = await this.invitationService.create(
            {
              scheduling: scheduling._id.toString(),
              senderId: senderId,
              employeesIds: invitedIds,
            },
            session,
          );

          const io = getIO();

          invitations.forEach((invitation) => {
            const receiverId = invitation.receiver._id;

            io.to(receiverId.toString()).emit('invitation:received', {
              message: 'Você recebeu um novo convite de agendamento.',
              invitation: invitation,
            });
          });
        }

        createdScheduling = scheduling;
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(String(error), 500);
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

    if (filters.startDate) {
      query.startDate = filters.startDate;
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

  async addService(
    schedulingId: string,
    serviceId: string,
  ): Promise<IScheduling | null> {
    const scheduling = await SchedulingModel.findById(schedulingId);

    if (!scheduling) {
      throw new AppError('Agendamento não encontrado', 404);
    }

    const service = await ServiceModel.findById(serviceId);

    if (!service) {
      throw new AppError('Serviço não encontrado', 404);
    }

    if (service.status.includes('Inativo')) {
      throw new AppError('Serviço selecionado não está ativo.', 400);
    }

    const serviceAlrdyAdded = scheduling.service.some(
      (id) => id.toString() === serviceId.toString(),
    );

    if (serviceAlrdyAdded) {
      throw new AppError('Serviço já existe no agendamento.', 400);
    }

    scheduling.service.push(service._id);

    await scheduling.save();

    return scheduling;
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

  async updateStartDate(
    id: string,
    startDate: Date,
  ): Promise<IScheduling | null> {
    const scheduling = await SchedulingModel.findByIdAndUpdate(id);

    if (!scheduling) {
      throw new AppError('Agendamento não encontrado.', 404);
    }

    if (
      scheduling.endDate &&
      new Date(startDate) >= new Date(scheduling.endDate)
    ) {
      throw new AppError(
        'A data de início não pode ser menor que a data de término.',
        400,
      );
    }

    scheduling.startDate = startDate;
    await scheduling.save();

    return scheduling;
  }

  async updateEndDate(id: string, endDate: Date): Promise<IScheduling | null> {
    const scheduling = await SchedulingModel.findById(id);

    if (!scheduling) {
      throw new AppError('Agendamento não encontrado.', 404);
    }

    if (new Date(endDate) <= new Date(scheduling.startDate)) {
      throw new AppError(
        'A data de término não pode ser menor que a data de início.',
        400,
      );
    }

    scheduling.endDate = endDate;
    await scheduling.save();

    return scheduling;
  }

  async generateReceipt(id: string): Promise<ReceiptDTO> {
    const scheduling = await SchedulingModel.findById(id).populate('service');

    if (!scheduling) {
      throw new AppError('Agendamento não encontrado.', 404);
    }

    const serviceNames = (scheduling.service as any[]).map((s) => s.name);

    return {
      client: scheduling.client,
      clientTel: scheduling.clientTel,
      plate: scheduling.plate,
      car: scheduling.car,
      endDate: scheduling.endDate,
      service: serviceNames,
    };
  }
}
