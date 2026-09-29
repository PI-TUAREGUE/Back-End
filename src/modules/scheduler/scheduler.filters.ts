import { SchedulerStatus } from './scheduler.enum';

export interface ISchedulerFilters {
    client?: string;
    plate?: string;
    car?: string;
    startDate?: Date;
    endDate?: Date;
    status?: SchedulerStatus;
}