import { Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { skip } from 'rxjs';
import dayjs, { Dayjs } from 'dayjs/esm';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { AlertComponent } from '../../../components/alert/alert.component';
import { ButtonComponent } from '../../../components/button/button.component';
import { FormFieldComponent } from '../../../components/form-field/form-field.component';
import { IconButtonComponent } from '../../../components/icon-button/icon-button.component';
import { LabelComponent } from '../../../components/label/label.component';
import { LoadingOverlayDirective } from '../../../components/loading-overlay/loading-overlay.directive';
import {
  MultiSelectBadgeOption,
  MultiSelectBadgesComponent,
} from '../../../components/multi-select-badges/multi-select-badges.component';
import { SelectDirective } from '../../../components/select/select.directive';
import { AuthStore } from '../../../core/auth/auth.store';
import { parseWorkingHours, WEEKDAYS, WeeklyWorkingHours } from '../../../model/working-hours.model';
import { AppointmentStatus } from '../appointment-status.enum';
import { CalendarAppointment } from '../appointment.model';
import { Employee } from '../../employees/employee.model';
import { AppointmentsCalendarStore, CalendarView } from './appointments-calendar.store';
import { CalendarGridDay, CalendarTimeGridComponent } from './calendar-time-grid.component';
import { CalendarMonthDay, CalendarMonthGridComponent } from './calendar-month-grid.component';

const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTH_LABELS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];
const MONTH_GRID_CELLS = 42;
const DEFAULT_START_HOUR = 8;
const DEFAULT_END_HOUR = 20;

function parseHourFloor(time: string): number {
  return Number(time.split(':')[0]);
}

function parseHourCeil(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return minutes ? hours! + 1 : hours!;
}

function computeHourBounds(workingHours: WeeklyWorkingHours | null): {
  startHour: number;
  endHour: number;
} {
  const configuredDays = workingHours
    ? WEEKDAYS.map((weekday) => workingHours[weekday]).filter((day) => day !== null)
    : [];
  if (!configuredDays.length) {
    return { startHour: DEFAULT_START_HOUR, endHour: DEFAULT_END_HOUR };
  }
  return {
    startHour: Math.min(...configuredDays.map((day) => parseHourFloor(day.start))),
    endHour: Math.max(...configuredDays.map((day) => parseHourCeil(day.end))),
  };
}

function groupByDate(appointments: CalendarAppointment[]): Map<string, CalendarAppointment[]> {
  const map = new Map<string, CalendarAppointment[]>();
  for (const appointment of appointments) {
    const date = dayjs(appointment.startTime).format('YYYY-MM-DD');
    const list = map.get(date);
    if (list) {
      list.push(appointment);
    } else {
      map.set(date, [appointment]);
    }
  }
  return map;
}

function buildGridDays(
  anchorDate: string,
  view: CalendarView,
  appointments: CalendarAppointment[],
): CalendarGridDay[] {
  const byDate = groupByDate(appointments);
  const today = dayjs().format('YYYY-MM-DD');
  if (view === 'day') {
    const date = anchorDate;
    return [
      {
        date,
        label: `${WEEKDAY_SHORT[dayjs(date).day()]} ${dayjs(date).format('DD/MM')}`,
        isToday: date === today,
        appointments: byDate.get(date) ?? [],
      },
    ];
  }
  const weekStart = dayjs(anchorDate).startOf('week');
  return Array.from({ length: 7 }, (_, i) => {
    const day = weekStart.add(i, 'day');
    const date = day.format('YYYY-MM-DD');
    return {
      date,
      label: `${WEEKDAY_SHORT[day.day()]} ${day.format('DD/MM')}`,
      isToday: date === today,
      appointments: byDate.get(date) ?? [],
    };
  });
}

function buildMonthDays(
  anchorDate: string,
  appointments: CalendarAppointment[],
): CalendarMonthDay[] {
  const byDate = groupByDate(appointments);
  const monthStart = dayjs(anchorDate).startOf('month');
  const gridStart = monthStart.startOf('week');
  const today = dayjs().format('YYYY-MM-DD');
  return Array.from({ length: MONTH_GRID_CELLS }, (_, i) => {
    const day = gridStart.add(i, 'day');
    const date = day.format('YYYY-MM-DD');
    return {
      date,
      dayOfMonth: day.date(),
      isCurrentMonth: day.month() === monthStart.month(),
      isToday: date === today,
      appointments: byDate.get(date) ?? [],
    };
  });
}

function formatFullDate(day: Dayjs): string {
  return `${day.date()} de ${MONTH_LABELS[day.month()]!.toLowerCase()} de ${day.year()}`;
}

function periodLabel(anchorDate: string, view: CalendarView): string {
  const anchor = dayjs(anchorDate);
  if (view === 'day') {
    return formatFullDate(anchor);
  }
  if (view === 'month') {
    return `${MONTH_LABELS[anchor.month()]} de ${anchor.year()}`;
  }
  const start = anchor.startOf('week');
  const end = anchor.endOf('week');
  if (start.month() === end.month()) {
    return `${start.date()} - ${formatFullDate(end)}`;
  }
  return `${start.date()}/${start.month() + 1} - ${formatFullDate(end)}`;
}

interface FiltersFormModel {
  employeeId: string;
  statuses: AppointmentStatus[];
}

const STATUS_OPTIONS: MultiSelectBadgeOption<AppointmentStatus>[] = [
  { value: AppointmentStatus.Scheduled, label: AppointmentStatus.Scheduled, variant: 'primary' },
  { value: AppointmentStatus.Completed, label: AppointmentStatus.Completed, variant: 'secondary' },
  { value: AppointmentStatus.Cancelled, label: AppointmentStatus.Cancelled },
  { value: AppointmentStatus.NoShow, label: AppointmentStatus.NoShow },
];

@Component({
  selector: 'app-appointments-calendar',
  imports: [
    AlertComponent,
    ButtonComponent,
    CalendarMonthGridComponent,
    CalendarTimeGridComponent,
    FormField,
    FormFieldComponent,
    FormRoot,
    IconButtonComponent,
    LabelComponent,
    LoadingOverlayDirective,
    MultiSelectBadgesComponent,
    RouterLink,
    SelectDirective,
  ],
  templateUrl: './appointments-calendar.component.html',
  host: {
    class: 'page-container',
  },
  providers: [AppointmentsCalendarStore],
})
export class AppointmentsCalendarComponent {
  readonly employees = input.required<Employee[]>();

  protected readonly store = inject(AppointmentsCalendarStore);
  private readonly authStore = inject(AuthStore);

  protected readonly LucideChevronLeft = LucideChevronLeft;
  protected readonly LucideChevronRight = LucideChevronRight;
  protected readonly views: { value: CalendarView; label: string }[] = [
    { value: 'day', label: 'Dia' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mês' },
  ];

  protected readonly statusOptions = STATUS_OPTIONS;

  protected readonly filtersModel = signal<FiltersFormModel>({
    employeeId: '',
    statuses: Object.values(AppointmentStatus),
  });
  protected readonly filtersForm = form(this.filtersModel);

  protected readonly periodLabel = computed(() =>
    periodLabel(this.store.anchorDate(), this.store.view()),
  );

  protected readonly filteredAppointments = computed(() => {
    const statuses = this.filtersForm.statuses().value();
    return this.store.appointments().filter((appointment) => statuses.includes(appointment.status));
  });

  protected readonly gridDays = computed(() =>
    buildGridDays(this.store.anchorDate(), this.store.view(), this.filteredAppointments()),
  );

  protected readonly monthDays = computed(() =>
    buildMonthDays(this.store.anchorDate(), this.filteredAppointments()),
  );

  protected readonly hourBounds = computed(() =>
    computeHourBounds(
      parseWorkingHours(this.authStore.session()?.activeOrganization?.workingHours),
    ),
  );

  constructor() {
    toObservable(this.filtersForm().value)
      .pipe(skip(1), takeUntilDestroyed())
      .subscribe((value) => this.store.setEmployeeId(value.employeeId));
  }

  protected setView(view: CalendarView) {
    this.store.setView(view);
  }
}
