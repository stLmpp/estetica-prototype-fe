import { Component, inject, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { _IdGenerator } from '@angular/cdk/a11y';

export type BadgeVariant = 'primary' | 'secondary' | 'default';

export interface MultiSelectBadgeOption<T> {
  value: T;
  label: string;
  variant?: BadgeVariant;
}

@Component({
  selector: 'app-multi-select-badges',
  templateUrl: './multi-select-badges.component.html',
  host: {
    class: 'flex flex-wrap gap-2',
    role: 'group',
  },
})
export class MultiSelectBadgesComponent<T> implements FormValueControl<T[]> {
  readonly options = input.required<MultiSelectBadgeOption<T>[]>();
  readonly disabled = input(false);

  readonly value = model<T[]>([]);

  protected readonly idPrefix = inject(_IdGenerator).getId('app-multi-select-badge-');

  protected isChecked(option: MultiSelectBadgeOption<T>): boolean {
    return this.value().includes(option.value);
  }

  protected toggle(option: MultiSelectBadgeOption<T>, checked: boolean) {
    const current = this.value();
    this.value.set(checked ? [...current, option.value] : current.filter((v) => v !== option.value));
  }

  protected variantClasses(variant: BadgeVariant, checked: boolean): string {
    if (!checked) {
      return 'border-neutral-300 text-neutral-500 dark:border-neutral-600 dark:text-neutral-400';
    }
    if (variant === 'primary') {
      return 'border-primary-500 bg-primary-500 text-white';
    }
    if (variant === 'secondary') {
      return 'border-primary-200 bg-primary-100 text-primary-900 dark:border-primary-800 dark:bg-primary-900 dark:text-primary-200';
    }
    return 'border-neutral-400 bg-neutral-200 text-neutral-700 dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-200';
  }
}
