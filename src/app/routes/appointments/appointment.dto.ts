import { PaginationMetadata } from '../../shared/pagination.model';
import { AppointmentStatus } from './appointment-status.enum';
import { Appointment } from './appointment.model';

export interface AppointmentPayload {
  customerId: string;
  employeeId: string;
  catalogItemId: string;
  startTime: string;
  endTime: string;
  notes?: string;
  priceApplied?: string;
}

export interface UpdateAppointmentPayload {
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export interface UpdateAppointmentStatusPayload {
  status: AppointmentStatus;
}

export interface ListAppointmentFilter {
  page?: number;
  limit?: 10 | 25 | 50 | 100;
  customerId?: string;
  employeeId?: string;
  catalogItemId?: string;
  status?: AppointmentStatus;
  from?: string;
  to?: string;
}

export interface ListAppointmentResult {
  items: Appointment[];
  meta: PaginationMetadata;
}
