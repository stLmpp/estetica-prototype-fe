import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

@Component({
  selector: 'app-badge',
  imports: [],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'px-2.5 py-0.5 text-xs font-bold rounded-full',
    '[class]': 'classes()',
  },
})
export class Badge {
  readonly primary = input(false, { transform: booleanAttribute });
  readonly secondary = input(false, { transform: booleanAttribute });

  private readonly styles = {
    primary: 'bg-primary-500 text-white',
    secondary: 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-200',
    default: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200',
  };

  private readonly variant = computed(() => {
    return this.primary() ? 'primary' : this.secondary() ? 'secondary' : 'default';
  });

  protected readonly classes = computed(() => this.styles[this.variant()]);
}
