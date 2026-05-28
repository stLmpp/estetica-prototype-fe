import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-chip',
  imports: [],
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex items-center gap-1.5 rounded-full border px-4 py-1 text-sm font-medium',
    '[class]': 'classes()',
  },
})
export class ChipComponent {
  readonly secondary = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly remove = output();

  private readonly styles = {
    default: 'border-primary-300 text-primary-700 dark:border-primary-600 dark:text-primary-300',
    secondary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
  };

  private readonly variant = computed(() => (this.secondary() ? 'secondary' : 'default'));

  protected readonly classes = computed(() => this.styles[this.variant()]);
}
