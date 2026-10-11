import { model, Schema, Document, Types } from 'mongoose';

import { SchedulerStatus } from './scheduler.enum';

export interface IScheduler extends Document {
  client: string;
  plate: string;
  car: string;
  startDate: Date;
  endDate?: Date;
  employee: Types.ObjectId[];
  service: Types.ObjectId[];
  status: SchedulerStatus;
}

const schedulerSchema = new Schema<IScheduler>(
  {
    client: { type: String, required: true },
    plate: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      match: [
        /^[A-Z]{3}-\d[0-9A-Za-z]?\d{2}$/,
        'O formato da placa é inválido. O padrão esperado é xxx-9?99',
      ],
    },
    car: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    employee: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Employee',
        },
      ],

      validate: [
        (val: Types.ObjectId[]) => val && val.length > 0,
        'É obrigatório atribuir pelo menos um funcionário.',
      ],
    },

    service: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Service',
        },
      ],

      validate: [
        (val: Types.ObjectId[]) => val && val.length > 0,
        'É obrigatório atribuir pelo menos um serviço.',
      ],
    },
    status: {
      type: String,
      enum: Object.values(SchedulerStatus),
      default: SchedulerStatus.SCHEDULED,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const SchedulerModel = model<IScheduler>('Scheduler', schedulerSchema);
