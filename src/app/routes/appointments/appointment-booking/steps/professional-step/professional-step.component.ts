import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { LoadingOverlayDirective } from '../../../../../components/loading-overlay/loading-overlay.directive';
import { Employee } from '../../../../employees/employee.model';
import { AppointmentBookingStore } from '../../appointment-booking.store';

@Component({
  selector: 'app-appointment-booking-professional-step',
  imports: [ButtonComponent, LoadingOverlayDirective],
  templateUrl: './professional-step.component.html',
})
export class ProfessionalStepComponent {
  protected readonly store = inject(AppointmentBookingStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected selectEmployee(employee: Employee) {
    this.store.setEmployee(employee);
  }

  protected back() {
    this.router.navigate(['../service'], { relativeTo: this.route });
  }

  protected next() {
    this.router.navigate(['../schedule'], { relativeTo: this.route });
  }
}
