import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ListboxValueChangeEvent } from '@angular/cdk/listbox';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { ListboxOptionComponent } from '../../../../../components/listbox/listbox-option.component';
import { ListboxComponent } from '../../../../../components/listbox/listbox.component';
import { LoadingOverlayDirective } from '../../../../../components/loading-overlay/loading-overlay.directive';
import { isoDurationToMinutes } from '../../../../../shared/duration.util';
import { AppointmentBookingStore } from '../../appointment-booking.store';

interface ServiceOption {
  id: string;
  name: string;
  price: string | null;
  durationMinutes: number | null;
}

@Component({
  selector: 'app-appointment-booking-service-step',
  imports: [
    ButtonComponent,
    CurrencyPipe,
    ListboxComponent,
    ListboxOptionComponent,
    LoadingOverlayDirective,
    RouterLink,
  ],
  templateUrl: './service-step.component.html',
})
export class ServiceStepComponent {
  protected readonly store = inject(AppointmentBookingStore);

  protected readonly selectedServiceIds = computed(() => {
    const service = this.store.service();
    return service ? [service.id] : [];
  });

  protected readonly serviceOptions = computed<ServiceOption[]>(() =>
    this.store.services().map((service) => ({
      id: service.id,
      name: service.name,
      price: service.defaultPrice ?? null,
      durationMinutes: service.defaultDuration ? isoDurationToMinutes(service.defaultDuration) : null,
    })),
  );

  protected onServiceChange(event: ListboxValueChangeEvent<string>) {
    const service = this.store.services().find((item) => item.id === event.value[0]);
    if (service) {
      this.store.setService(service);
    }
  }
}
