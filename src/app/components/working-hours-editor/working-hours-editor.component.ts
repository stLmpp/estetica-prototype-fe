import { Component, computed, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { InputDirective } from '../input/input.directive';
import {
  EMPTY_WEEKLY_WORKING_HOURS,
  WEEKDAY_LABELS,
  WEEKDAYS,
  Weekday,
  WeeklyWorkingHours,
} from '../../model/working-hours.model';

interface WorkingHoursRow {
  weekday: Weekday;
  label: string;
  isOpen: boolean;
  start: string;
  end: string;
}

const DEFAULT_START = '09:00';
const DEFAULT_END = '18:00';

@Component({
  selector: 'app-working-hours-editor',
  imports: [InputDirective],
  templateUrl: './working-hours-editor.component.html',
  host: {
    class: 'flex flex-col gap-1.5',
  },
})
export class WorkingHoursEditorComponent implements FormValueControl<WeeklyWorkingHours> {
  readonly value = model<WeeklyWorkingHours>(EMPTY_WEEKLY_WORKING_HOURS);

  protected readonly rows = computed<WorkingHoursRow[]>(() =>
    WEEKDAYS.map((weekday) => {
      const day = this.value()[weekday];
      return {
        weekday,
        label: WEEKDAY_LABELS[weekday],
        isOpen: day !== null,
        start: day?.start ?? DEFAULT_START,
        end: day?.end ?? DEFAULT_END,
      };
    }),
  );

  protected toggleOpen(weekday: Weekday, open: boolean) {
    const current = this.value();
    const existing = current[weekday];
    this.value.set({
      ...current,
      [weekday]: open ? (existing ?? { start: DEFAULT_START, end: DEFAULT_END }) : null,
    });
  }

  protected setStart(weekday: Weekday, start: string) {
    const current = this.value();
    const existing = current[weekday];
    if (!existing) {
      return;
    }
    this.value.set({ ...current, [weekday]: { ...existing, start } });
  }

  protected setEnd(weekday: Weekday, end: string) {
    const current = this.value();
    const existing = current[weekday];
    if (!existing) {
      return;
    }
    this.value.set({ ...current, [weekday]: { ...existing, end } });
  }
}
