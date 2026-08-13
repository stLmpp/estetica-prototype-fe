import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { form, FormField, FormRoot, required, validate } from '@angular/forms/signals';
import dayjs from 'dayjs';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { CalendarComponent } from '../../../../../components/calendar/calendar.component';
import { FormFieldComponent } from '../../../../../components/form-field/form-field.component';
import { InputDirective } from '../../../../../components/input/input.directive';
import { LabelComponent } from '../../../../../components/label/label.component';
import { LoadingOverlayDirective } from '../../../../../components/loading-overlay/loading-overlay.directive';
import { DayScheduleAppointment } from '../../../appointment.model';
import { AppointmentBookingStore } from '../../appointment-booking.store';
import { NgxMaskDirective } from 'ngx-mask';
import { toObservable } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs';

const PRICE_REGEXP = /^\d{1,8}(\.\d{1,2})?$/;
const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;
const SLOT_MINUTES = 30;

interface TimeSlot {
  time: string;
  busy: boolean;
  past: boolean;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function buildTimeSlots(date: string, appointments: DayScheduleAppointment[]): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = dayjs();
  for (let minutes = DAY_START_HOUR * 60; minutes < DAY_END_HOUR * 60; minutes += SLOT_MINUTES) {
    const time = `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
    const slotStart = dayjs(`${date}T${time}`);
    const slotEnd = slotStart.add(SLOT_MINUTES, 'minute');
    const busy = appointments.some((appointment) => {
      const start = dayjs(appointment.startTime);
      const end = dayjs(appointment.endTime);
      return slotStart.isBefore(end) && slotEnd.isAfter(start);
    });
    const past = slotStart.isBefore(now);
    slots.push({ time, busy, past });
  }
  return slots;
}

function isSlotAvailable(slot: TimeSlot): boolean {
  return !slot.busy && !slot.past;
}

function firstAvailableSlotTime(slots: TimeSlot[], preferredTime: string): string {
  const preferred = slots.find((slot) => slot.time === preferredTime);
  if (preferred && isSlotAvailable(preferred)) {
    return preferred.time;
  }
  return slots.find(isSlotAvailable)?.time ?? '';
}

@Component({
  selector: 'app-appointment-booking-schedule-step',
  imports: [
    ButtonComponent,
    CalendarComponent,
    FormField,
    FormFieldComponent,
    FormRoot,
    InputDirective,
    LabelComponent,
    LoadingOverlayDirective,
    NgxMaskDirective,
  ],
  templateUrl: './schedule-step.component.html',
})
export class ScheduleStepComponent {
  constructor() {
    this.store.loadDaySchedule(toObservable(this.f.date().value).pipe(skip(1)));
  }

  protected readonly store = inject(AppointmentBookingStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly minDate = dayjs().format('YYYY-MM-DD');

  protected readonly model = signal({
    date: this.store.date(),
    startTime: firstAvailableSlotTime(
      buildTimeSlots(this.store.date(), this.store.daySchedule()),
      this.store.startTime(),
    ),
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

  protected readonly timeSlots = computed<TimeSlot[]>(() =>
    buildTimeSlots(this.f.date().value(), this.store.daySchedule()),
  );

  protected selectStartTime(slot: TimeSlot) {
    if (!isSlotAvailable(slot)) {
      return;
    }
    this.f.startTime().value.set(slot.time);
  }

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
    this.store.setSchedule(this.model());
    this.router.navigate(['../professional'], { relativeTo: this.route });
  }

  protected next() {
    if (this.f().invalid()) {
      return;
    }
    this.store.setSchedule(this.model());
    this.router.navigate(['../review'], { relativeTo: this.route });
  }
}
