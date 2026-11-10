import bcrypt from 'bcrypt';

import { Document, Schema, SchemaTypes, model } from 'mongoose';

import { EmployeeModel, IEmployee } from './employee.model';

import { EmployeeRole } from './roles.enum';
import { EmployeeStatus } from './status.enum';

import { AppError } from '../../shared/errors/AppError';
import { IEmployeeFilters } from './employee.filters';
import { SchedulingModel } from '../scheduling/scheduling.model';

export type EmployeeDTO = Omit<IEmployee, '_id' | 'createdAt' | 'updatedAt'>;

export class EmployeeService {
  async create(data: EmployeeDTO): Promise<IEmployee> {
    const employee = await EmployeeModel.findOne({
      cpf: data.cpf,
    })
      .select('_id')
      .lean()
      .exec();

    if (employee) {
      throw new AppError(
        'Já existe um funcionário cadastrado com este CPF.',
        409,
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await EmployeeModel.create({ ...data, password: hashedPassword });
  }

  async findById(id: string): Promise<IEmployee | null> {
    const employee = await EmployeeModel.findById(id).exec();

    if (!employee) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    return employee;
  }

  async findAll(filters: IEmployeeFilters): Promise<EmployeeDTO[]> {
    const query: Record<string, any> = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.role) {
      query.role = filters.role;
    }

    if (filters.name) {
      query.name = { $regex: filters.name, $options: 'i' };
    }

    return await EmployeeModel.find(query).exec();
  }

  async addRole(id: string, role: EmployeeRole): Promise<IEmployee | null> {
    const updatedEmployee = await EmployeeModel.findByIdAndUpdate(
      id,
      {
        $addToSet: { roles: role },
      },
      {
        new: true,
        runValidators: true,
      },
    ).exec();

    if (!updatedEmployee) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    return updatedEmployee;
  }

  async removeRole(id: string, role: EmployeeRole): Promise<IEmployee | null> {
    const scheduling = await SchedulingModel.findOne({
      employee: id,
      status: { $in: ['Agendado', 'Em progresso', 'Cancelado'] as any },
    });

    const employee = await EmployeeModel.findById(id).exec();

    if (!employee) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    if (scheduling && employee.roles.includes(EmployeeRole.MECHANIC)) {
      throw new AppError(
        'Não é possível alterar o status do colaborador, pois existem agendamentos em andamento com este colaborador vinculado.',
        400,
      );
    }

    const updatedEmployee = EmployeeModel.findByIdAndUpdate(
      id,
      {
        $pull: { roles: role },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    return updatedEmployee;
  }

  async updateStatus(
    id: string,
    status: EmployeeStatus,
  ): Promise<IEmployee | null> {
    const employee = await EmployeeModel.findById(id).exec();

    if (!employee) {
      throw new AppError('Usuário não encontrado.', 400);
    }

    const scheduling = await SchedulingModel.findOne({
      employee: id,
      status: { $in: ['Agendado', 'Em progresso', 'Cancelado'] as any },
    });

    if (scheduling && employee.roles.includes(EmployeeRole.MECHANIC)) {
      throw new AppError(
        'Não é possível alterar o status do colaborador, pois existem agendamentos em andamento com este colaborador vinculado.',
        400,
      );
    }

    const updatedEmployee = await EmployeeModel.findByIdAndUpdate(
      id,
      { $set: { status: status } },
      {
        new: true,
        runValidators: true,
      },
    ).exec();

    if (!updatedEmployee) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    return updatedEmployee;
  }
}
