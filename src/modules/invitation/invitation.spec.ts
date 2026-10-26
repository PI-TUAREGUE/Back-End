import { Types } from 'mongoose';

import { AppError } from '../../shared/errors/AppError';
import { SchedulingModel } from '../scheduling/scheduling.model';

import { IInvitation, InvitationModel } from './invitation.model';
import { InvitationStatus } from './status.enum';
import { InvitationService } from './invitation.service';

jest.mock('./invitation.model', () => ({
  InvitationModel: {
    findById: jest.fn(),
  },
}));

jest.mock('../scheduling/scheduling.model', () => ({
  SchedulingModel: {
    findByIdAndUpdate: jest.fn(),
  },
}));

describe('InvitationService.respondToInvitation', () => {
  const invitationId = new Types.ObjectId().toString();
  const schedulingId = new Types.ObjectId();
  const receiverId = new Types.ObjectId().toString();
  const anotherEmployeeId = new Types.ObjectId().toString();

  let invitationService: InvitationService;

  const createInvitation = (
    status: InvitationStatus = InvitationStatus.PENDING,
  ): IInvitation =>
    ({
      scheduling: schedulingId,
      receiver: new Types.ObjectId(receiverId),
      status,
      save: jest.fn().mockResolvedValue(undefined),
    }) as unknown as IInvitation;

  const mockInvitationLookup = (invitation: IInvitation | null): void => {
    jest
      .spyOn(InvitationModel, 'findById')
      .mockReturnValue(
        Promise.resolve(invitation) as unknown as ReturnType<
          typeof InvitationModel.findById
        >,
      );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    invitationService = new InvitationService();
  });

  it('lança AppError quando o convite não existe', async () => {
    mockInvitationLookup(null);

    await expect(
      invitationService.respondToInvitation(
        invitationId,
        receiverId,
        InvitationStatus.ACCEPTED,
      ),
    ).rejects.toThrow(AppError);

    expect(SchedulingModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('lança AppError quando o convite não está pendente', async () => {
    mockInvitationLookup(createInvitation(InvitationStatus.ACCEPTED));

    await expect(
      invitationService.respondToInvitation(
        invitationId,
        receiverId,
        InvitationStatus.ACCEPTED,
      ),
    ).rejects.toThrow(AppError);

    expect(SchedulingModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('lança AppError quando quem responde não é o mecânico destinatário', async () => {
    mockInvitationLookup(createInvitation());

    await expect(
      invitationService.respondToInvitation(
        invitationId,
        anotherEmployeeId,
        InvitationStatus.ACCEPTED,
      ),
    ).rejects.toThrow(AppError);

    expect(SchedulingModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('altera o status para ACCEPTED e adiciona o mecânico ao agendamento', async () => {
    const invitation = createInvitation();
    mockInvitationLookup(invitation);

    await invitationService.respondToInvitation(
      invitationId,
      receiverId,
      InvitationStatus.ACCEPTED,
    );

    expect(invitation.status).toBe(InvitationStatus.ACCEPTED);
    expect(invitation.save).toHaveBeenCalledTimes(1);
    expect(SchedulingModel.findByIdAndUpdate).toHaveBeenCalledWith(
      schedulingId,
      {
        $addToSet: {
          employee: expect.any(Types.ObjectId),
        },
      },
    );

    const update = jest.mocked(SchedulingModel.findByIdAndUpdate).mock
      .calls[0][1];
    expect(
      (
        update as { $addToSet: { employee: Types.ObjectId } }
      ).$addToSet.employee.toString(),
    ).toBe(receiverId);
  });

  it('altera o status para REJECTED sem modificar o agendamento', async () => {
    const invitation = createInvitation();
    mockInvitationLookup(invitation);

    await invitationService.respondToInvitation(
      invitationId,
      receiverId,
      InvitationStatus.REJECTED,
    );

    expect(invitation.status).toBe(InvitationStatus.REJECTED);
    expect(invitation.save).toHaveBeenCalled();
    expect(SchedulingModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });
});
