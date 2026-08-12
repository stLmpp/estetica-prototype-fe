import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListboxValueChangeEvent } from '@angular/cdk/listbox';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { ListboxOptionComponent } from '../../../../../components/listbox/listbox-option.component';
import { ListboxComponent } from '../../../../../components/listbox/listbox.component';
import { LoadingOverlayDirective } from '../../../../../components/loading-overlay/loading-overlay.directive';
import { AppointmentBookingStore } from '../../appointment-booking.store';

@Component({
  selector: 'app-appointment-booking-professional-step',
  imports: [ButtonComponent, ListboxComponent, ListboxOptionComponent, LoadingOverlayDirective],
  templateUrl: './professional-step.component.html',
})
export class ProfessionalStepComponent {
  protected readonly store = inject(AppointmentBookingStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly selectedEmployeeIds = computed(() => {
    const employee = this.store.employee();
    return employee ? [employee.id] : [];
  });

  protected onEmployeeChange(event: ListboxValueChangeEvent<string>) {
    const employee = this.store.employees().find((item) => item.id === event.value[0]);
    if (employee) {
      this.store.setEmployee(employee);
    }
  }

  protected back() {
    this.router.navigate(['../service'], { relativeTo: this.route });
  }

  protected next() {
    this.router.navigate(['../schedule'], { relativeTo: this.route });
  }
}
