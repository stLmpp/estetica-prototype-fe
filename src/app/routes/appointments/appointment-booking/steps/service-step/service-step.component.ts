import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { LoadingOverlayDirective } from '../../../../../components/loading-overlay/loading-overlay.directive';
import { CatalogItem } from '../../../../catalog-items/catalog-item.model';
import { AppointmentBookingStore } from '../../appointment-booking.store';

@Component({
  selector: 'app-appointment-booking-service-step',
  imports: [ButtonComponent, LoadingOverlayDirective],
  templateUrl: './service-step.component.html',
})
export class ServiceStepComponent {
  protected readonly store = inject(AppointmentBookingStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected selectService(service: CatalogItem) {
    this.store.setService(service);
  }

  protected back() {
    this.router.navigate(['../customer'], { relativeTo: this.route });
  }

  protected next() {
    this.router.navigate(['../professional'], { relativeTo: this.route });
  }
}
