import { model, Schema, Document, Types } from 'mongoose';

import { InvitationStatus } from './status.enum';

export interface IInvitation extends Document {
  scheduling: Types.ObjectId;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  status: InvitationStatus;
  respondedAt: Date;
}

const invitationSchema = new Schema<IInvitation>(
  {
    scheduling: {
      type: Schema.Types.ObjectId,
      ref: 'Scheduling',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(InvitationStatus),
      default: InvitationStatus.PENDING,
      required: true,
    },
    respondedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

export const InvitationModel = model<IInvitation>(
  'Invitation',
  invitationSchema,
);
