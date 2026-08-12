import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListboxValueChangeEvent } from '@angular/cdk/listbox';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { ListboxOptionComponent } from '../../../../../components/listbox/listbox-option.component';
import { ListboxComponent } from '../../../../../components/listbox/listbox.component';
import { LoadingOverlayDirective } from '../../../../../components/loading-overlay/loading-overlay.directive';
import { AppointmentBookingStore } from '../../appointment-booking.store';

@Component({
  selector: 'app-appointment-booking-service-step',
  imports: [ButtonComponent, ListboxComponent, ListboxOptionComponent, LoadingOverlayDirective],
  templateUrl: './service-step.component.html',
})
export class ServiceStepComponent {
  protected readonly store = inject(AppointmentBookingStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly selectedServiceIds = computed(() => {
    const service = this.store.service();
    return service ? [service.id] : [];
  });

  protected onServiceChange(event: ListboxValueChangeEvent<string>) {
    const service = this.store.services().find((item) => item.id === event.value[0]);
    if (service) {
      this.store.setService(service);
    }
  }

  protected back() {
    this.router.navigate(['../customer'], { relativeTo: this.route });
  }

  protected next() {
    this.router.navigate(['../professional'], { relativeTo: this.route });
  }
}
