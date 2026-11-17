import { model, Schema, Document, Types } from 'mongoose';

import { ServiceStatus } from './status.enum';

export interface IService extends Document {
  avatarUrl?: string;
  name: string;
  status: ServiceStatus;
  createdBy?: Types.ObjectId | { _id: Types.ObjectId; name: string };
}

const serviceSchema = new Schema<IService>(
  {
    avatarUrl: { type: String, required: false },
    name: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(ServiceStatus),
      default: ServiceStatus.ACTIVE,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const ServiceModel = model<IService>('Service', serviceSchema);
