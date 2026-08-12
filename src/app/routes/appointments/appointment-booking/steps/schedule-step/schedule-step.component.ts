import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { form, FormField, FormRoot, required, validate } from '@angular/forms/signals';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { FormFieldComponent } from '../../../../../components/form-field/form-field.component';
import { InputDirective } from '../../../../../components/input/input.directive';
import { LabelComponent } from '../../../../../components/label/label.component';
import { AppointmentBookingStore } from '../../appointment-booking.store';

const PRICE_REGEXP = /^\d{1,8}(\.\d{1,2})?$/;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

@Component({
  selector: 'app-appointment-booking-schedule-step',
  imports: [ButtonComponent, FormField, FormFieldComponent, FormRoot, InputDirective, LabelComponent],
  templateUrl: './schedule-step.component.html',
})
export class ScheduleStepComponent {
  private readonly store = inject(AppointmentBookingStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly model = signal({
    date: this.store.date(),
    startTime: this.store.startTime(),
    durationMinutes: this.store.durationMinutes(),
    priceApplied: this.store.priceApplied(),
    notes: this.store.notes(),
  });

  protected readonly f = form(this.model, (schema) => {
    required(schema.date, { message: 'Data é obrigatória' });
    required(schema.startTime, { message: 'Horário é obrigatório' });
    required(schema.durationMinutes, { message: 'Duração é obrigatória' });
    validate(schema.durationMinutes, ({ value }) => {
      const trimmed = value().trim();
      if (Number.isInteger(Number(trimmed)) && Number(trimmed) > 0) {
        return null;
      }
      return { kind: 'invalidDuration', message: 'Duração inválida' };
    });
    validate(schema.priceApplied, ({ value }) => {
      const trimmed = value().trim();
      if (!trimmed || PRICE_REGEXP.test(trimmed)) {
        return null;
      }
      return { kind: 'invalidPrice', message: 'Preço inválido' };
    });
  });

  protected computeEndTimeLabel(): string {
    const { startTime, durationMinutes } = this.f().value();
    const [hours, minutes] = startTime.split(':').map(Number);
    if (hours === undefined || minutes === undefined) {
      return '';
    }
    const totalMinutes = hours * 60 + minutes + Number(durationMinutes);
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${pad(endHours)}:${pad(endMinutes)}`;
  }

  protected back() {
    this.store.setSchedule(this.f().value());
    this.router.navigate(['../professional'], { relativeTo: this.route });
  }

  protected next() {
    if (this.f().invalid()) {
      return;
    }
    this.store.setSchedule(this.f().value());
    this.router.navigate(['../review'], { relativeTo: this.route });
  }
}
