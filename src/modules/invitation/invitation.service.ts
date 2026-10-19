import { InvitationModel, IInvitation } from './invitation.model';
import { InvitationStatus } from './status.enum';

import { AppError } from '../../shared/errors/AppError';

import { Types, ClientSession } from 'mongoose';
import { EmployeeStatus } from '../employee/status.enum';
import { InvitationFilters } from './invitation.filters';

import { IScheduling } from '../scheduling/scheduling.model';
import { SchedulingModel } from '../scheduling/scheduling.model';

export type InvitationDTO = {
  scheduling: string;
  senderId: string;
  employeesIds: string[];
};

export class InvitationService {
  async create(
    data: InvitationDTO,
    session?: ClientSession,
  ): Promise<IInvitation[]> {
    if (!data.employeesIds || data.employeesIds.length === 0) {
      return [];
    }

    const schedulingObjId = new Types.ObjectId(data.scheduling);
    const senderObjId = new Types.ObjectId(data.senderId);

    const invitationsData = data.employeesIds.map((employeeId) => ({
      scheduling: schedulingObjId,
      sender: senderObjId,
      receiver: new Types.ObjectId(employeeId),
    }));

    return (await InvitationModel.insertMany(invitationsData, {
      session,
    })) as IInvitation[];
  }

  async findById(id: String): Promise<IInvitation> {
    const invitation = await InvitationModel.findById(id).exec();

    if (!invitation) {
      throw new AppError('Convite não encontrado', 404);
    }

    return invitation;
  }

  async findByEmployeeId(
    empId: string,
    filters: InvitationFilters,
  ): Promise<IInvitation[]> {
    const query: Record<string, any> = {
      receiver: empId,
    };

    if (
      filters.status &&
      Object.values(InvitationStatus).includes(filters.status)
    ) {
      query.status = filters.status;
    }

    if (filters.date) {
      query.date = filters.date;
    }

    return await InvitationModel.find(query).exec();
  }

  async respondToInvitation(
    id: string,
    empId: string,
    status: InvitationStatus,
  ): Promise<void> {
    const invitation = await InvitationModel.findById(id);

    if (!invitation) {
      throw new AppError('Convite não encontrado');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
    }

    invitation.status = status;
    await invitation.save();

    if (status === InvitationStatus.ACCEPTED) {
      const schedulingId = invitation.scheduling._id || invitation.scheduling;

      await SchedulingModel.findByIdAndUpdate(schedulingId, {
        $addToSet: { employee: new Types.ObjectId(empId) },
      });
    }

    if (status === InvitationStatus.REJECTED) {
      await invitation.save();
    }
  }
}
