import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BadgeComponent } from '../../../../components/badge/badge.component';
import { LoadingOverlayDirective } from '../../../../components/loading-overlay/loading-overlay.directive';
import { AppointmentStatus } from '../../../appointments/appointment-status.enum';
import { AppointmentService } from '../../../appointments/appointment.service';
import { CustomerDetailsStore } from '../customer-details.store';

const HISTORY_LIMIT = 10;

@Component({
  selector: 'app-customer-appointments-tab',
  imports: [BadgeComponent, DatePipe, LoadingOverlayDirective, RouterLink],
  templateUrl: './customer-appointments-tab.component.html',
})
export class CustomerAppointmentsTabComponent {
  private readonly appointmentService = inject(AppointmentService);
  protected readonly store = inject(CustomerDetailsStore);

  protected readonly AppointmentStatus = AppointmentStatus;

  private readonly appointmentsResource = rxResource({
    params: () => this.store.customerId() || undefined,
    stream: ({ params: customerId }) =>
      this.appointmentService.list({ customerId, limit: HISTORY_LIMIT }),
  });
  protected readonly appointmentsLoading = computed(() => this.appointmentsResource.isLoading());
  protected readonly appointments = computed(() => this.appointmentsResource.value()?.items ?? []);
}
