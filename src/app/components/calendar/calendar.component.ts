import { Component, computed, input, linkedSignal, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import dayjs, { Dayjs } from 'dayjs';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { IconButtonComponent } from '../icon-button/icon-button.component';

interface CalendarDay {
  date: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isDisabled: boolean;
}

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
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
const DAYS_IN_GRID = 42;

@Component({
  selector: 'app-calendar',
  imports: [IconButtonComponent],
  templateUrl: './calendar.component.html',
  host: {
    class: 'block w-72',
  },
})
export class CalendarComponent implements FormValueControl<string> {
  readonly value = model<string>('');
  readonly disabled = input(false);
  readonly minDate = input<string | null>(null);

  protected readonly LucideChevronLeft = LucideChevronLeft;
  protected readonly LucideChevronRight = LucideChevronRight;
  protected readonly weekdayLabels = WEEKDAY_LABELS;

  protected readonly viewMonth = linkedSignal<Dayjs>(() =>
    (this.value() ? dayjs(this.value()) : dayjs()).startOf('month'),
  );

  protected readonly monthLabel = computed(
    () => `${MONTH_LABELS[this.viewMonth().month()]} de ${this.viewMonth().year()}`,
  );

  protected readonly days = computed<CalendarDay[]>(() => {
    const monthStart = this.viewMonth();
    const gridStart = monthStart.startOf('week');
    const today = dayjs().format('YYYY-MM-DD');
    const minDate = this.minDate();
    return Array.from({ length: DAYS_IN_GRID }, (_, index) => {
      const date = gridStart.add(index, 'day');
      const iso = date.format('YYYY-MM-DD');
      return {
        date: iso,
        dayOfMonth: date.date(),
        isCurrentMonth: date.month() === monthStart.month(),
        isToday: iso === today,
        isDisabled: minDate !== null && iso < minDate,
      };
    });
  });

  protected previousMonth() {
    this.viewMonth.set(this.viewMonth().subtract(1, 'month'));
  }

  protected nextMonth() {
    this.viewMonth.set(this.viewMonth().add(1, 'month'));
  }

  protected selectDay(day: CalendarDay) {
    if (this.disabled() || day.isDisabled) {
      return;
    }
    this.value.set(day.date);
  }
}
