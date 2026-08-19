import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { form, FormField, FormRoot, required, validate } from '@angular/forms/signals';
import dayjs from 'dayjs/esm';
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
import { AuthStore } from '../../../../../core/auth/auth.store';
import {
  DayWorkingHours,
  parseWorkingHours,
  weekdayFromDate,
  WeeklyWorkingHours,
} from '../../../../../model/working-hours.model';

const PRICE_REGEXP = /^\d{1,8}(\.\d{1,2})?$/;
const DEFAULT_DAY_HOURS: DayWorkingHours = { start: '08:00', end: '20:00' };
const SLOT_MINUTES = 30;

interface TimeSlot {
  time: string;
  busy: boolean;
  past: boolean;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function resolveDayHours(
  date: string,
  employeeWorkingHours: WeeklyWorkingHours | null | undefined,
  orgWorkingHours: WeeklyWorkingHours | null,
): DayWorkingHours | null {
  const weekday = weekdayFromDate(date);
  if (employeeWorkingHours) {
    return employeeWorkingHours[weekday];
  }
  if (orgWorkingHours) {
    return orgWorkingHours[weekday];
  }
  return DEFAULT_DAY_HOURS;
}

function buildTimeSlots(
  date: string,
  appointments: DayScheduleAppointment[],
  dayHours: DayWorkingHours | null,
): TimeSlot[] {
  if (!dayHours) {
    return [];
  }
  const slots: TimeSlot[] = [];
  const now = dayjs();
  const [startHour, startMinute] = dayHours.start.split(':').map(Number);
  const [endHour, endMinute] = dayHours.end.split(':').map(Number);
  const startTotalMinutes = startHour! * 60 + startMinute!;
  const endTotalMinutes = endHour! * 60 + endMinute!;
  for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += SLOT_MINUTES) {
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
    RouterLink,
  ],
  templateUrl: './schedule-step.component.html',
})
export class ScheduleStepComponent {
  constructor() {
    this.store.loadDaySchedule(toObservable(this.f.date().value).pipe(skip(1)));
  }

  protected readonly store = inject(AppointmentBookingStore);
  private readonly authStore = inject(AuthStore);

  protected readonly minDate = dayjs().format('YYYY-MM-DD');

  private readonly orgWorkingHours = computed(() =>
    parseWorkingHours(this.authStore.session()?.activeOrganization?.workingHours),
  );

  protected readonly model = signal({
    date: this.store.date(),
    startTime: firstAvailableSlotTime(
      buildTimeSlots(
        this.store.date(),
        this.store.daySchedule(),
        resolveDayHours(
          this.store.date(),
          this.store.employee()?.workingHours,
          this.orgWorkingHours(),
        ),
      ),
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
      const duration = value();
      if (duration === null || (Number.isInteger(duration) && duration > 0)) {
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

  protected readonly dayHours = computed<DayWorkingHours | null>(() =>
    resolveDayHours(
      this.f.date().value(),
      this.store.employee()?.workingHours,
      this.orgWorkingHours(),
    ),
  );

  protected readonly timeSlots = computed<TimeSlot[]>(() =>
    buildTimeSlots(this.f.date().value(), this.store.daySchedule(), this.dayHours()),
  );

  protected selectStartTime(slot: TimeSlot) {
    if (!isSlotAvailable(slot)) {
      return;
    }
    this.f.startTime().value.set(slot.time);
  }

  protected readonly endTimeLabel = computed(() => {
    const { startTime, durationMinutes } = this.f().value();
    const [hours, minutes] = startTime.split(':').map(Number);
    if (hours === undefined || minutes === undefined) {
      return '';
    }
    const totalMinutes = hours * 60 + minutes + (durationMinutes ?? 0);
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${pad(endHours)}:${pad(endMinutes)}`;
  });

  protected back() {
    this.store.setSchedule(this.model());
  }

  protected next() {
    if (this.f().invalid()) {
      return;
    }
    this.store.setSchedule(this.model());
  }
}
