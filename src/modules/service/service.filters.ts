import { ServiceStatus } from './status.enum';

export interface IServiceFilters {
  name?: string;
  status?: ServiceStatus;
}
