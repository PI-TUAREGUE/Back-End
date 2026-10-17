import { InvitationModel, IInvitation } from './invitation.model';
import { InvitationStatus } from './status.enum';

import { AppError } from '../../shared/errors/AppError';
import { EmployeeModel } from '../employee/employee.model';

import { Types, ClientSession } from 'mongoose';
import { EmployeeStatus } from '../employee/status.enum';

export type InvitationDTO = Omit<
  IInvitation,
  '_id' | 'status' | 'respondedAt' | 'createdAt' | 'updatedAt'
>;

export class InvitationService {
  async create(
    scheduling: string,
    senderId: string,
    employeesIds: string[],
    session?: ClientSession,
  ): Promise<IInvitation[]> {
    const employees = await EmployeeModel.find({
      _id: { $in: employeesIds },
      status: EmployeeStatus.ACTIVE,
    });

    const schedulingObjId = new Types.ObjectId(scheduling);
    const senderObjId = new Types.ObjectId(senderId);

    const invitationsData = employees.map((emp) => ({
      scheduling: schedulingObjId,
      senderId: senderObjId,
      receiver: emp._id,
    }));

    return await InvitationModel.insertMany(invitationsData, { session });
  }
}
