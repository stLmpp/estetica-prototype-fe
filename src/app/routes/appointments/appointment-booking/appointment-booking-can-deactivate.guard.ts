import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { AppointmentBookingComponent } from './appointment-booking.component';
import { AppointmentBookingStore } from './appointment-booking.store';

export function appointmentBookingCanDeactivateGuard(): CanDeactivateFn<AppointmentBookingComponent> {
  return () => {
    inject(AppointmentBookingStore).reset();
    return true;
  };
}
