import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { AppointmentBookingStore } from '../../appointment-booking.store';

@Component({
  selector: 'app-appointment-booking-review-step',
  imports: [ButtonComponent, RouterLink],
  templateUrl: './review-step.component.html',
})
export class ReviewStepComponent {
  protected readonly store = inject(AppointmentBookingStore);
  private readonly router = inject(Router);

  protected readonly endTimeLabel = computed(() => {
    const [hours, minutes] = this.store.startTime().split(':').map(Number);
    if (hours === undefined || minutes === undefined) {
      return '';
    }
    const totalMinutes = hours * 60 + minutes + Number(this.store.durationMinutes());
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  });

  protected confirm() {
    this.store.submit().subscribe((appointment) => {
      if (appointment) {
        this.router.navigate(['/appointments']);
      }
    });
  }
}
