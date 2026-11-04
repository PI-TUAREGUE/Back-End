import { model, Schema, Document } from 'mongoose';

import { ServiceStatus } from './status.enum';

export interface IService extends Document {
  avatarUrl: string;
  name: string;
  status: ServiceStatus;
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
  },
  {
    timestamps: true,
  },
);

export const ServiceModel = model<IService>('Service', serviceSchema);
