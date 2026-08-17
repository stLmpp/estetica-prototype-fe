import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { AppointmentDetail } from '../appointment.model';
import { AppointmentService } from '../appointment.service';

export function appointmentDetailsResolver(): ResolveFn<AppointmentDetail> {
  return (route: ActivatedRouteSnapshot) =>
    inject(AppointmentService).getById(route.paramMap.get('appointmentId')!);
}
