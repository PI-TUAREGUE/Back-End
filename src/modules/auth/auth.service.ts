import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { IToken } from './auth.interface';
import { EmployeeModel } from '../employee/employee.model';

import { AppError } from '../../shared/errors/AppError';

export class AuthService {
  async login(email: string, password: string): Promise<IToken | null> {
    const employee = await EmployeeModel.findOne({ email: email });

    if (!employee) {
      throw new AppError('Email ou senha incorretos', 401);
    }

    const matchPassword = await bcrypt.compare(password, employee!.password);
    if (!matchPassword) {
      throw new AppError('Email ou senha incorretos', 401);
    }

    const payload = {
      id: employee!._id,
      name: employee!.name,
      email: employee!.email,
      roles: employee!.roles,
    };

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new AppError(
        'JWT_SECRET não está definida nas variáveis de ambiente',
        500,
      );
    }

    const token = jwt.sign(payload, secret, {
      expiresIn: '1h',
    });

    return { token };
  }
}
