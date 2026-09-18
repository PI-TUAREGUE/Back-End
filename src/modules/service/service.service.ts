import { ServiceModel, IService } from './service.model';

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

    return await ServiceModel.create(data);
  }

  async findById(id: string): Promise<IService | null> {
    const service = await ServiceModel.findById(id).exec();

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

    return await ServiceModel.find(query).exec();
  }

  async updateStatus(
    id: string,
    status: ServiceStatus,
  ): Promise<IService | null> {
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
