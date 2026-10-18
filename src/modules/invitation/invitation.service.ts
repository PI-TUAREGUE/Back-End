import { InvitationModel, IInvitation } from './invitation.model';
import { InvitationStatus } from './status.enum';

import { AppError } from '../../shared/errors/AppError';
import { EmployeeModel } from '../employee/employee.model';

import { Types, ClientSession } from 'mongoose';
import { EmployeeStatus } from '../employee/status.enum';

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
}
