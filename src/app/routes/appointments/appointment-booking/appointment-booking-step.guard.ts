import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppointmentBookingStore } from './appointment-booking.store';

type BookingRequirement = 'customer' | 'service' | 'employee';

const STEP_PATH_BY_REQUIREMENT: Record<BookingRequirement, string> = {
  customer: 'customer',
  service: 'service',
  employee: 'professional',
};

const hasValue: Record<BookingRequirement, (store: AppointmentBookingStore) => boolean> = {
  customer: (store) => !!store.customer(),
  service: (store) => !!store.service(),
  employee: (store) => !!store.employee(),
};

export function appointmentBookingStepGuard(requirements: BookingRequirement[]): CanActivateFn {
  return () => {
    const store = inject(AppointmentBookingStore);
    const router = inject(Router);

    const missing = requirements.find((requirement) => !hasValue[requirement](store));
    if (missing) {
      return router.createUrlTree(['/appointments/new', STEP_PATH_BY_REQUIREMENT[missing]]);
    }

    return true;
  };
}
