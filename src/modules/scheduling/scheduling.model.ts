import { model, Schema, Document, Types } from 'mongoose';

import { SchedulingStatus } from './scheduling.enum';

export interface IScheduling extends Document {
  client: string;
  plate: string;
  car: string;
  startDate: Date;
  endDate?: Date;
  employee: Types.ObjectId[];
  service: Types.ObjectId[];
  status: SchedulingStatus;
}

const schedulingSchema = new Schema<IScheduling>(
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
      enum: Object.values(SchedulingStatus),
      default: SchedulingStatus.SCHEDULED,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const SchedulingModel = model<IScheduling>(
  'Scheduling',
  schedulingSchema,
);
