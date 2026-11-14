import { AppError } from '../../shared/errors/AppError';

import { EmployeeModel } from '../employee/employee.model';
import { EmployeeStatus } from '../employee/status.enum';
import { InvitationService } from '../invitation/invitation.service';
import { ServiceModel } from '../service/service.model';

import { SchedulingModel } from './scheduling.model';
import { SchedulingStatus } from './scheduling.enum';
import { SchedulingDTO, SchedulingService } from './scheduling.service';

jest.mock(
  '../../shared/config/webSocket.ts',
  () => ({
    getIO: jest.fn().mockReturnValue({
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    }),
  }),
  { virtual: true },
);

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
  jest.spyOn(EmployeeModel, 'find').mockResolvedValue(employees as never);
};

const mockServiceCount = (count: number): void => {
  jest.spyOn(ServiceModel, 'countDocuments').mockResolvedValue(count as never);
};

const mockCountDocuments = (count: number): void => {
  jest.spyOn(EmployeeModel, 'countDocuments').mockResolvedValue(count as never);
};

describe('SchedulingService.create', () => {
  let schedulingService: SchedulingService;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    mockActiveEmployees([{ _id: senderId, status: EmployeeStatus.ACTIVE }]);
    mockCountDocuments(1);
    mockServiceCount(1);

    jest.spyOn(SchedulingModel, 'create').mockResolvedValue([
      {
        _id: 'scheduling-id-1',
        ...createSchedulingDTO(),
        owner: senderId,
        employee: [senderId],
        editors: [senderId],
      } as never,
    ]);

    schedulingService = new SchedulingService(new InvitationService());
  });

  it('lança AppError com status 400 quando a data de término é anterior à de início', async () => {
    const data = createSchedulingDTO({
      endDate: new Date('2026-10-27T09:59:59.999Z'),
    });

    await expectAppError(schedulingService.create(data, senderId), 400);
  });

  it('adiciona o senderId automaticamente quando employee vem vazio', async () => {
    const data = createSchedulingDTO({ employee: [] });

    const result = await schedulingService.create(data, senderId);

    expect(result).toBeDefined();
    expect(result._id).toBe('scheduling-id-1');
    expect(SchedulingModel.create).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          employee: [senderId],
          owner: senderId,
          editors: [senderId],
        }),
      ],
      expect.any(Object),
    );
  });

  it('lança AppError com status 400 quando a lista de serviços está vazia', async () => {
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
    mockActiveEmployees([]);

    const data = createSchedulingDTO({ employee: ['mechanic-2'] });

    await expectAppError(schedulingService.create(data, senderId), 404);
  });

  it('lança AppError com status 404 quando um serviço não foi encontrado', async () => {
    mockServiceCount(0);

    const data = createSchedulingDTO();

    await expectAppError(schedulingService.create(data, senderId), 404);
  });

  it('deve criar um agendamento com sucesso quando todos os dados forem válidos', async () => {
    const data = createSchedulingDTO({
      editors: ['editor-1'],
    });

    const result = await schedulingService.create(data, senderId);

    expect(result).toBeDefined();
    expect(result._id).toBe('scheduling-id-1');
    expect(SchedulingModel.create).toHaveBeenCalledTimes(1);
    expect(SchedulingModel.create).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          owner: senderId,
          editors: [senderId, 'editor-1'],
        }),
      ],
      expect.any(Object),
    );
  });
});
