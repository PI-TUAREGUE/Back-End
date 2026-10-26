import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

import { AppError } from '../../shared/errors/AppError';
import { EmployeeModel, IEmployee } from '../employee/employee.model';
import { EmployeeRole } from '../employee/roles.enum';
import { EmployeeStatus } from '../employee/status.enum';

import { AuthService } from './auth.service';

jest.mock('../employee/employee.model', () => ({
  EmployeeModel: {
    findOne: jest.fn(),
  },
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

const mockCompare = bcrypt.compare as jest.Mock<
  Promise<boolean>,
  [password: string, hashedPassword: string]
>;
const mockSign = jwt.sign as unknown as jest.Mock<
  string,
  [payload: object, secret: string, options: jwt.SignOptions]
>;

describe('AuthService.login', () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  const email = 'mechanic@example.com';
  const password = 'valid-password';
  const employee: Partial<IEmployee> & { _id: Types.ObjectId } = {
    _id: new Types.ObjectId(),
    name: 'Mechanic',
    email,
    password: 'hashed-password',
    roles: [EmployeeRole.MECHANIC],
    status: EmployeeStatus.ACTIVE,
  };

  let authService: AuthService;

  const mockEmployeeLookup = (result: IEmployee | null): void => {
    jest
      .spyOn(EmployeeModel, 'findOne')
      .mockReturnValue(
        Promise.resolve(result) as unknown as ReturnType<
          typeof EmployeeModel.findOne
        >,
      );
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    authService = new AuthService();
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  afterAll(() => {
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
  });

  it('lança AppError com status 401 quando o e-mail não é encontrado', async () => {
    mockEmployeeLookup(null);

    await expect(authService.login(email, password)).rejects.toThrow(AppError);
    await expect(authService.login(email, password)).rejects.toHaveProperty(
      'statusCode',
      401,
    );

    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('lança AppError com status 401 quando a senha está incorreta', async () => {
    mockEmployeeLookup(employee as IEmployee);
    mockCompare.mockResolvedValue(false);

    await expect(authService.login(email, password)).rejects.toThrow(AppError);
    await expect(authService.login(email, password)).rejects.toHaveProperty(
      'statusCode',
      401,
    );

    expect(bcrypt.compare).toHaveBeenCalledWith(password, employee.password);
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('autentica credenciais válidas e retorna o token assinado com os dados do usuário', async () => {
    const token = 'signed-jwt-token';
    mockEmployeeLookup(employee as IEmployee);
    mockCompare.mockResolvedValue(true);
    mockSign.mockReturnValue(token);

    await expect(authService.login(email, password)).resolves.toEqual({
      token,
    });

    expect(EmployeeModel.findOne).toHaveBeenCalledWith({ email });
    expect(bcrypt.compare).toHaveBeenCalledWith(password, employee.password);
    expect(jwt.sign).toHaveBeenCalledWith(
      {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        roles: employee.roles,
      },
      'test-jwt-secret',
      { expiresIn: '1h' },
    );
  });
});
