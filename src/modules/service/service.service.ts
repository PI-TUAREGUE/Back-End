import { ServiceModel, IService } from './service.model';
import { SchedulingModel } from '../scheduling/scheduling.model';

import { ServiceStatus } from './status.enum';
import { AppError } from '../../shared/errors/AppError';
import { IServiceFilters } from './service.filters';

export type ServiceDTO = Omit<IService, '_id' | 'createdAt' | 'updatedAt'>;

export class ServiceService {
  async create(data: ServiceDTO): Promise<IService> {
    const service = await ServiceModel.findOne({
      name: data.name,
    })

      .select('_id')
      .lean()
      .exec();

    if (service) {
      throw new AppError('Já existe um serviço com esse nome.', 409);
    }

    const newService = await ServiceModel.create(data);
    return await newService.populate('createdBy', 'name');
  }

  async findById(id: string): Promise<IService | null> {
    const service = await ServiceModel.findById(id)
      .populate('createdBy', 'name')
      .exec();

    if (!service) {
      throw new AppError('Serviço não encontrado', 404);
    }

    return service;
  }

  async findAll(filters: IServiceFilters): Promise<ServiceDTO[]> {
    const query: Record<string, any> = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.name) {
      query.name = { $regex: filters.name, $options: 'i' };
    }

    return await ServiceModel.find(query)
      .populate('createdBy', 'name')
      .exec();
  }

  async updateStatus(
    id: string,
    status: ServiceStatus,
  ): Promise<IService | null> {
    const scheduling = await SchedulingModel.findOne({
      service: id,
      status: { $in: ['Agendado', 'Em progresso', 'Cancelado'] as any },
    }).exec();

    if (scheduling) {
      throw new AppError(
        'Não é possível alterar o status do serviço, pois existem agendamentos em andamento com este serviço vinculado.',
        400,
      );
    }

    const updateService = await ServiceModel.findByIdAndUpdate(
      id,
      { $set: { status: status } },
      {
        new: true,
        runValidators: true,
      },
    ).exec();

    if (!updateService) {
      throw new AppError('Serviço não encontrado.', 404);
    }

    return updateService;
  }
}
