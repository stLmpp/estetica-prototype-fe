import { Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentStatus } from '../appointment-status.enum';
import { CalendarAppointment } from '../appointment.model';

export interface CalendarMonthDay {
  date: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: CalendarAppointment[];
}

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MAX_CHIPS_PER_DAY = 3;

function statusColorClass(status: AppointmentStatus): string {
  if (status === AppointmentStatus.Scheduled) {
    return 'bg-primary-500 text-white';
  }
  if (status === AppointmentStatus.Completed) {
    return 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-200';
  }
  return 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200';
}

@Component({
  selector: 'app-calendar-month-grid',
  imports: [DatePipe, RouterLink],
  templateUrl: './calendar-month-grid.component.html',
  host: {
    class: 'block',
  },
})
export class CalendarMonthGridComponent {
  readonly days = input.required<CalendarMonthDay[]>();

  protected readonly AppointmentStatus = AppointmentStatus;
  protected readonly weekdayLabels = WEEKDAY_LABELS;

  protected readonly cells = computed(() =>
    this.days().map((day) => {
      const sorted = [...day.appointments].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
      return {
        day,
        visible: sorted.slice(0, MAX_CHIPS_PER_DAY).map((appointment) => ({
          appointment,
          colorClass: statusColorClass(appointment.status),
        })),
        overflowCount: Math.max(sorted.length - MAX_CHIPS_PER_DAY, 0),
      };
    }),
  );
}
