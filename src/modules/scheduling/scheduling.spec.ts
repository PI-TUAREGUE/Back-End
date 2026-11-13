import { AppError } from '../../shared/errors/AppError';
import mongoose from 'mongoose';

import { EmployeeModel } from '../employee/employee.model';
import { EmployeeStatus } from '../employee/status.enum';
import { InvitationService } from '../invitation/invitation.service';
import { ServiceModel } from '../service/service.model';

import { SchedulingModel } from './scheduling.model';
import { SchedulingStatus } from './scheduling.enum';
import { SchedulingDTO, SchedulingService } from './scheduling.service';

// Mock do Socket.io se necessário para evitar erros na transação de convites
jest.mock('../../shared/infra/socket/socket', () => ({
  getIO: jest.fn().mockReturnValue({
    to: jest.fn().mockReturnValue({
      emit: jest.fn(),
    }),
  }),
}));

jest.mock('../invitation/invitation.service', () => ({
  InvitationService: jest.fn().mockImplementation(() => ({
    create: jest.fn().mockResolvedValue([]),
  })),
}));

jest.mock('./scheduling.model', () => ({
  SchedulingModel: {
    create: jest.fn(),
  },
}));

jest.mock('../employee/employee.model', () => ({
  EmployeeModel: {
    countDocuments: jest.fn(),
    find: jest.fn(),
  },
}));

jest.mock('../service/service.model', () => ({
  ServiceModel: {
    countDocuments: jest.fn(),
  },
}));

// Mock do mongoose session para transações
jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  startSession: jest.fn().mockResolvedValue({
    withTransaction: jest.fn().mockImplementation(async (cb) => await cb()),
    endSession: jest.fn(),
  }),
}));

const senderId = 'mechanic-1';

const createSchedulingDTO = (
  overrides: Partial<SchedulingDTO> = {},
): SchedulingDTO => ({
  client: 'Cliente',
  clientTel: '(11) 9 4356-8527',
  plate: 'ABC-1234',
  car: 'Carro',
  startDate: new Date('2026-10-27T10:00:00.000Z'),
  endDate: new Date('2026-10-27T11:00:00.000Z'),
  employee: [senderId],
  editors: [],
  service: ['service-1'],
  status: SchedulingStatus.SCHEDULED,
  ...overrides,
});

const expectAppError = async (
  promise: Promise<unknown>,
  statusCode: number,
): Promise<void> => {
  await expect(promise).rejects.toThrow(AppError);
  await expect(promise).rejects.toHaveProperty('statusCode', statusCode);
};

const mockActiveEmployees = (employees: unknown[]): void => {
  jest
    .spyOn(EmployeeModel, 'find')
    .mockReturnValue(
      Promise.resolve(employees) as ReturnType<typeof EmployeeModel.find>,
    );
};

const mockServiceCount = (count: number): void => {
  jest
    .spyOn(ServiceModel, 'countDocuments')
    .mockReturnValue(
      Promise.resolve(count) as ReturnType<typeof ServiceModel.countDocuments>,
    );
};

const mockCountDocuments = (count: number): void => {
  jest
    .spyOn(EmployeeModel, 'countDocuments')
    .mockReturnValue(
      Promise.resolve(count) as ReturnType<typeof EmployeeModel.countDocuments>,
    );
};

describe('SchedulingService.create', () => {
  let schedulingService: SchedulingService;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    schedulingService = new SchedulingService(new InvitationService());
  });

  it('lança AppError com status 400 quando a data de término é anterior à de início', async () => {
    const data = createSchedulingDTO({
      endDate: new Date('2026-10-27T09:59:59.999Z'),
    });

    await expectAppError(schedulingService.create(data, senderId), 400);
  });

  it('lança AppError com status 400 quando a lista de mecânicos está vazia', async () => {
    const data = createSchedulingDTO({ employee: [] });

    await expectAppError(schedulingService.create(data, senderId), 400);
  });

  it('lança AppError com status 400 quando a lista de serviços está vazia', async () => {
    mockCountDocuments(1);
    mockActiveEmployees([{ _id: senderId, status: EmployeeStatus.ACTIVE }]);
    mockServiceCount(0);

    const data = createSchedulingDTO({ service: [] });

    await expectAppError(schedulingService.create(data, senderId), 400);
  });

  it('lança AppError com status 404 quando um mecânico editor está inativo ou não foi encontrado', async () => {
    mockCountDocuments(0);

    const data = createSchedulingDTO({ editors: ['editor-inativo-1'] });

    await expectAppError(schedulingService.create(data, senderId), 404);
  });

  it('lança AppError com status 404 quando um mecânico está inativo ou não foi encontrado', async () => {
    mockCountDocuments(1);
    mockActiveEmployees([]);
    mockServiceCount(1);

    const data = createSchedulingDTO({ employee: ['mechanic-2'] });

    await expectAppError(schedulingService.create(data, senderId), 404);
  });

  it('lança AppError com status 404 quando um serviço não foi encontrado', async () => {
    mockCountDocuments(1);
    mockActiveEmployees([{ _id: senderId, status: EmployeeStatus.ACTIVE }]);
    mockServiceCount(0);

    const data = createSchedulingDTO();

    await expectAppError(schedulingService.create(data, senderId), 404);
  });

  it('deve criar um agendamento com sucesso quando todos os dados forem válidos', async () => {
    mockCountDocuments(1);
    mockActiveEmployees([{ _id: senderId, status: EmployeeStatus.ACTIVE }]);
    mockServiceCount(1);

    const mockCreatedScheduling = {
      _id: 'scheduling-id-1',
      ...createSchedulingDTO(),
      owner: senderId,
    };

    jest
      .spyOn(SchedulingModel, 'create')
      .mockResolvedValue([mockCreatedScheduling as any]);

    const data = createSchedulingDTO({
      editors: ['editor-1'],
    });

    const result = await schedulingService.create(data, senderId);

    expect(result).toBeDefined();
    expect(result._id).toBe('scheduling-id-1');
    expect(SchedulingModel.create).toHaveBeenCalledTimes(1);
  });
});
