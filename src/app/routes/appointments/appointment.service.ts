import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { httpParamsFromObject } from '../../shared/http-params-from-object';
import { ApiKeyedResponse, ApiPaginatedResponse } from '../../model/api-response';
import {
  AppointmentPayload,
  ListAppointmentFilter,
  ListAppointmentResult,
  UpdateAppointmentPayload,
  UpdateAppointmentStatusPayload,
} from './appointment.dto';
import {
  Appointment,
  AppointmentDetail,
  CalendarAppointment,
  DayScheduleAppointment,
} from './appointment.model';

@Service()
export class AppointmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api}/v1/appointment`;

  list(filter: ListAppointmentFilter = {}) {
    const params = httpParamsFromObject({
      page: filter.page,
      limit: filter.limit,
      customerId: filter.customerId,
      employeeId: filter.employeeId,
      catalogItemId: filter.catalogItemId,
      status: filter.status,
      from: filter.from,
      to: filter.to,
    });
    return this.http.get<ApiPaginatedResponse<Appointment>>(this.baseUrl, { params }).pipe(
      map((response): ListAppointmentResult => ({
        items: response.data.items,
        meta: response.meta,
      })),
    );
  }

  getById(appointmentId: string) {
    return this.http
      .get<ApiKeyedResponse<'appointment', AppointmentDetail>>(`${this.baseUrl}/${appointmentId}`)
      .pipe(map((response) => response.data.appointment));
  }

  create(payload: AppointmentPayload) {
    return this.http
      .post<ApiKeyedResponse<'appointment', AppointmentDetail>>(this.baseUrl, {
        appointment: payload,
      })
      .pipe(map((response) => response.data.appointment));
  }

  update(appointmentId: string, payload: UpdateAppointmentPayload) {
    return this.http.patch<void>(`${this.baseUrl}/${appointmentId}`, {
      appointment: payload,
    });
  }

  updateStatus(appointmentId: string, payload: UpdateAppointmentStatusPayload) {
    return this.http.patch<void>(`${this.baseUrl}/${appointmentId}/status`, {
      appointment: payload,
    });
  }

  delete(appointmentId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${appointmentId}`);
  }

  getDaySchedule(employeeId: string, from: string, to: string) {
    const params = httpParamsFromObject({ employeeId, from, to });
    return this.http
      .get<ApiKeyedResponse<'appointments', DayScheduleAppointment[]>>(
        `${this.baseUrl}/day-schedule`,
        { params },
      )
      .pipe(map((response) => response.data.appointments));
  }

  getCalendarRange(from: string, to: string, employeeId: string | null) {
    const params = httpParamsFromObject({ from, to, employeeId: employeeId || undefined });
    return this.http
      .get<ApiKeyedResponse<'appointments', CalendarAppointment[]>>(
        `${this.baseUrl}/calendar-range`,
        { params },
      )
      .pipe(map((response) => response.data.appointments));
  }
}
