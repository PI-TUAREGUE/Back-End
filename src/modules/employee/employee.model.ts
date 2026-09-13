import { model, Schema, Document } from 'mongoose';

import { EmployeeRole } from './roles.enum';
import { EmployeeStatus } from './status.enum';

export interface IEmployee extends Document {
  name: string;
  cpf: string;
  email: string;
  password: string;
  roles: EmployeeRole[];
  status: EmployeeStatus;
}

const employeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    email: { type: String, lowercase: true, required: true, unique: true },
    password: { type: String, required: true },
    roles: {
      type: [String],
      enum: Object.values(EmployeeRole),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(EmployeeStatus),
      default: EmployeeStatus.ACTIVE,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const EmployeeModel = model<IEmployee>('Employee', employeeSchema);
