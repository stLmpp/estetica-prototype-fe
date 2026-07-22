import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-alert',
  imports: [],
  templateUrl: './alert.component.html',
  host: {
    class: 'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg',
    role: 'alert',
    '[class.bg-green-600]': 'success()',
    '[class.bg-red-600]': 'error()',
    '[class.bg-primary-500]': 'brand() || isDefault()',
  },
})
export class AlertComponent {
  readonly success = input(false, { transform: booleanAttribute });
  readonly error = input(false, { transform: booleanAttribute });
  readonly brand = input(false, { transform: booleanAttribute });

  readonly clickClose = output<Event>();
  readonly showClose = input(false, { transform: booleanAttribute });

  protected readonly isDefault = computed(() => !this.success() && !this.error() && !this.brand());
}
