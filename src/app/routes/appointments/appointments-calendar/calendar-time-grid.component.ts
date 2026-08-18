import { Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentStatus } from '../appointment-status.enum';
import { CalendarAppointment } from '../appointment.model';

export interface CalendarGridDay {
  date: string;
  label: string;
  isToday: boolean;
  appointments: CalendarAppointment[];
}

interface AppointmentBlock {
  appointment: CalendarAppointment;
  topPercent: number;
  heightPercent: number;
  column: number;
  columnCount: number;
  colorClass: string;
}

interface HourRow {
  hour: number;
  label: string;
}

const DEFAULT_START_HOUR = 8;
const DEFAULT_END_HOUR = 20;
const HOUR_HEIGHT_PX = 48;

function buildHourRows(startHour: number, endHour: number): HourRow[] {
  return Array.from({ length: endHour - startHour }, (_, i) => {
    const hour = startHour + i;
    return { hour, label: `${String(hour).padStart(2, '0')}:00` };
  });
}

function statusColorClass(status: AppointmentStatus): string {
  if (status === AppointmentStatus.Scheduled) {
    return 'bg-primary-500 text-white';
  }
  if (status === AppointmentStatus.Completed) {
    return 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-200';
  }
  return 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200';
}

function minutesFromDayStart(iso: string, startHour: number): number {
  const date = new Date(iso);
  return date.getHours() * 60 + date.getMinutes() - startHour * 60;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function layoutDay(
  appointments: CalendarAppointment[],
  startHour: number,
  totalMinutes: number,
): AppointmentBlock[] {
  const sorted = [...appointments].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );
  const raw = sorted.map((appointment) => {
    const start = clamp(minutesFromDayStart(appointment.startTime, startHour), 0, totalMinutes);
    const end = clamp(minutesFromDayStart(appointment.endTime, startHour), 0, totalMinutes);
    return { appointment, startMinutes: start, endMinutes: Math.max(end, start + 1), column: 0 };
  });

  const blocks: AppointmentBlock[] = [];
  let cluster: typeof raw = [];
  let clusterEnd = -1;

  function flush() {
    if (!cluster.length) {
      return;
    }
    const columnEnds: number[] = [];
    for (const block of cluster) {
      let column = columnEnds.findIndex((end) => end <= block.startMinutes);
      if (column === -1) {
        column = columnEnds.length;
        columnEnds.push(block.endMinutes);
      } else {
        columnEnds[column] = block.endMinutes;
      }
      block.column = column;
    }
    const columnCount = columnEnds.length;
    for (const block of cluster) {
      blocks.push({
        appointment: block.appointment,
        topPercent: (block.startMinutes / totalMinutes) * 100,
        heightPercent: ((block.endMinutes - block.startMinutes) / totalMinutes) * 100,
        column: block.column,
        columnCount,
        colorClass: statusColorClass(block.appointment.status),
      });
    }
    cluster = [];
  }

  for (const block of raw) {
    if (cluster.length && block.startMinutes >= clusterEnd) {
      flush();
      clusterEnd = -1;
    }
    cluster.push(block);
    clusterEnd = Math.max(clusterEnd, block.endMinutes);
  }
  flush();

  return blocks;
}

@Component({
  selector: 'app-calendar-time-grid',
  imports: [DatePipe, RouterLink],
  templateUrl: './calendar-time-grid.component.html',
  host: {
    class: 'block',
  },
})
export class CalendarTimeGridComponent {
  readonly days = input.required<CalendarGridDay[]>();
  readonly startHour = input(DEFAULT_START_HOUR);
  readonly endHour = input(DEFAULT_END_HOUR);

  protected readonly AppointmentStatus = AppointmentStatus;
  protected readonly hourHeightPx = HOUR_HEIGHT_PX;

  protected readonly hours = computed(() => buildHourRows(this.startHour(), this.endHour()));
  protected readonly gridHeightPx = computed(
    () => (this.endHour() - this.startHour()) * HOUR_HEIGHT_PX,
  );
  private readonly totalMinutes = computed(() => (this.endHour() - this.startHour()) * 60);

  protected readonly columns = computed(() =>
    this.days().map((day) => ({
      day,
      blocks: layoutDay(day.appointments, this.startHour(), this.totalMinutes()),
    })),
  );
}
