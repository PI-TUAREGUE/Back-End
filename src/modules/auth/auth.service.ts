import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { IToken } from './token.interface';
import { EmployeeModel } from '../employee/employee.model';

import { transporter } from '../../shared/config/nodemailer';

import { AppError } from '../../shared/errors/AppError';
import nodemailer from 'nodemailer';

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

  async forgotPassword(email: string): Promise<void> {
    const employee = await EmployeeModel.findOne({ email: email });

    if (!employee) {
      return;
    }

    const secret = process.env.JWT_RESET_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError(
        'Chave secreta para reset de senha não está configurada.',
        500,
      );
    }

    const token = jwt.sign(
      { userId: employee._id, purpose: 'password_reset' },
      secret,
      {
        expiresIn: '1h',
      },
    );

    const link = `http://localhost:3000/auth?token=${token}`;

    const messsage = `
      Olá, ${employee.name},
      Um pedido de reset de senha foi requisitado para seu e-mail.
      Para concluir o processo, acesse o link a seguir para completar o processo: ${link}.

      Por razões de segurança, este link irá expirar em 1h.

      Obrigado!
      `;

    let mailOptions = {
      from: process.env.MAIL_ADDRESS,
      to: employee.email,
      subject: 'Recueração de Senha',
      text: messsage,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('E-mail enviado: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const secret = process.env.JWT_RESET_SECRET;
    if (!secret) {
      throw new AppError('Chave secreta não configurada.', 500);
    }

    let decoded: any;

    try {
      decoded = jwt.verify(token, secret);
    } catch (error) {
      throw new AppError('Token inválido ou expirado', 400);
    }

    if (decoded.purpose !== 'password_reset') {
      throw new AppError('Token inválido para esta operação.', 400);
    }

    const employee = await EmployeeModel.findById(decoded.userId);
    if (!employee) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    employee.password = hashedPassword;
    await employee.save();
  }
}
