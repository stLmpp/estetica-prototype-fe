import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { of } from 'rxjs';
import { AppointmentDetail } from '../../appointments/appointment.model';
import { AppointmentService } from '../../appointments/appointment.service';

export function saleFormAppointmentResolver(): ResolveFn<AppointmentDetail | null> {
  return (route: ActivatedRouteSnapshot) => {
    const appointmentId = route.queryParamMap.get('appointmentId');
    return appointmentId ? inject(AppointmentService).getById(appointmentId) : of(null);
  };
}
