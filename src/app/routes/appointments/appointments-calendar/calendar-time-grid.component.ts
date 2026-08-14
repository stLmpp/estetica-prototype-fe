import { Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
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

const START_HOUR = 8;
const END_HOUR = 20;
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;
const HOUR_HEIGHT_PX = 48;

function statusColorClass(status: AppointmentStatus): string {
  if (status === AppointmentStatus.Scheduled) {
    return 'bg-primary-500 text-white';
  }
  if (status === AppointmentStatus.Completed) {
    return 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-200';
  }
  return 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200';
}

function minutesFromDayStart(iso: string): number {
  const date = new Date(iso);
  return date.getHours() * 60 + date.getMinutes() - START_HOUR * 60;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function layoutDay(appointments: CalendarAppointment[]): AppointmentBlock[] {
  const sorted = [...appointments].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );
  const raw = sorted.map((appointment) => {
    const start = clamp(minutesFromDayStart(appointment.startTime), 0, TOTAL_MINUTES);
    const end = clamp(minutesFromDayStart(appointment.endTime), 0, TOTAL_MINUTES);
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
        topPercent: (block.startMinutes / TOTAL_MINUTES) * 100,
        heightPercent: ((block.endMinutes - block.startMinutes) / TOTAL_MINUTES) * 100,
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
  imports: [DatePipe],
  templateUrl: './calendar-time-grid.component.html',
  host: {
    class: 'block',
  },
})
export class CalendarTimeGridComponent {
  readonly days = input.required<CalendarGridDay[]>();

  protected readonly AppointmentStatus = AppointmentStatus;
  protected readonly hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
  protected readonly hourHeightPx = HOUR_HEIGHT_PX;
  protected readonly gridHeightPx = (END_HOUR - START_HOUR) * HOUR_HEIGHT_PX;

  protected readonly columns = computed(() =>
    this.days().map((day) => ({ day, blocks: layoutDay(day.appointments) })),
  );

  protected hourLabel(hour: number): string {
    return `${String(hour).padStart(2, '0')}:00`;
  }
}
