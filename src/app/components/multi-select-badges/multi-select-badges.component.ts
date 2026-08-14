import { Component, computed, inject, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { _IdGenerator } from '@angular/cdk/a11y';

export type BadgeVariant = 'primary' | 'secondary' | 'default';

export interface MultiSelectBadgeOption<T> {
  value: T;
  label: string;
  variant?: BadgeVariant;
}

interface MultiSelectBadgeItem<T> {
  option: MultiSelectBadgeOption<T>;
  id: string;
  checked: boolean;
  colorClass: string;
}

const UNCHECKED_CLASS =
  'border-neutral-300 text-neutral-500 dark:border-neutral-600 dark:text-neutral-400';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  primary: 'border-primary-500 bg-primary-500 text-white',
  secondary:
    'border-primary-200 bg-primary-100 text-primary-900 dark:border-primary-800 dark:bg-primary-900 dark:text-primary-200',
  default:
    'border-neutral-400 bg-neutral-200 text-neutral-700 dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-200',
};

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

  private readonly idPrefix = inject(_IdGenerator).getId('app-multi-select-badge-');

  protected readonly items = computed<MultiSelectBadgeItem<T>[]>(() => {
    const selected = this.value();
    return this.options().map((option, index) => {
      const checked = selected.includes(option.value);
      return {
        option,
        id: `${this.idPrefix}-${index}`,
        checked,
        colorClass: checked ? VARIANT_CLASSES[option.variant ?? 'default'] : UNCHECKED_CLASS,
      };
    });
  });

  protected toggle(option: MultiSelectBadgeOption<T>, checked: boolean) {
    const current = this.value();
    this.value.set(
      checked ? [...current, option.value] : current.filter((v) => v !== option.value),
    );
  }
}
