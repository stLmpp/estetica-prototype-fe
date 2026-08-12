import { AppointmentStatus } from './appointment-status.enum';

export interface Appointment {
  id: string;
  status: AppointmentStatus;
  startTime: string;
  endTime: string;
  customerId: string;
  customerName: string;
  employeeId: string;
  employeeName: string;
  catalogItemId: string;
  catalogItemName: string;
}

export interface AppointmentDetail extends Appointment {
  notes?: string;
  priceApplied: string;
}
