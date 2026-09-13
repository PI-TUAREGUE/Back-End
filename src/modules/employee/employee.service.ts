import bcrypt from 'bcrypt';

import { EmployeeModel, IEmployee } from './employee.model';

import { EmployeeRole } from './roles.enum';
import { EmployeeStatus } from './status.enum';

import { AppError } from '../../shared/errors/AppError';

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

  async findAll(): Promise<EmployeeDTO[]> {
    return await EmployeeModel.find().exec();
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

    return updatedEmployee;
  }

  async updateStatus(
    id: string,
    status: EmployeeStatus,
  ): Promise<IEmployee | null> {
    const updatedEmployee = await EmployeeModel.findByIdAndUpdate(
      id,
      { $set: { status: status } },
      {
        new: true,
        runValidators: true,
      },
    ).exec();

    return updatedEmployee;
  }
}
