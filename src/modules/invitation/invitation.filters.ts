import { InvitationStatus } from './status.enum';

export interface InvitationFilters {
  status?: InvitationStatus;
  date?: Date;
}
