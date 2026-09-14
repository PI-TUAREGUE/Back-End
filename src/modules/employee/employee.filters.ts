import { EmployeeStatus } from './status.enum';
import { EmployeeRole } from './roles.enum';

export interface IEmployeeFilters {
  status?: EmployeeStatus;
  role?: EmployeeRole;
  name?: string;
}
