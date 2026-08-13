import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';
import { AppointmentBookingStore } from './appointment-booking.store';

/** Loads the service list before the service step activates, so it never renders mid-load. */
export function serviceStepServicesResolver(): ResolveFn<unknown> {
  return () => {
    const store = inject(AppointmentBookingStore);
    return store.loadServices();
  };
}

/** Loads the selected service's employees before the professional step activates. */
export function professionalStepEmployeesResolver(): ResolveFn<unknown> {
  return () => {
    const store = inject(AppointmentBookingStore);
    const service = store.service();
    if (!service) {
      return of(null);
    }
    return store.loadEmployees(service.id);
  };
}

/**
 * Loads the day schedule for the store's current date before the schedule
 * step activates, so its initial slot pick already has real data instead of
 * guessing and correcting itself once the fetch resolves after the fact.
 */
export function scheduleDayScheduleResolver(): ResolveFn<unknown> {
  return () => {
    const store = inject(AppointmentBookingStore);
    return store.loadDaySchedule(store.date());
  };
}
