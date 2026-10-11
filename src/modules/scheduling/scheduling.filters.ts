import { SchedulingStatus } from './scheduling.enum';

export interface ISchedulingFilters {
  client?: string;
  plate?: string;
  car?: string;
  startDate?: Date;
  endDate?: Date;
  status?: SchedulingStatus;
}
