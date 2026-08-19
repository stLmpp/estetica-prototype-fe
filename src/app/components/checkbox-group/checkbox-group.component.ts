import { ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
import { FormField, FormValueControl } from '@angular/forms/signals';
import { FormFieldInput } from '../form-field/form-field-input';

@Component({
  selector: 'app-checkbox-group',
  template: `
    @if (label(); as label) {
      <span class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{{ label }}</span>
    }
    <div class="flex flex-col gap-2">
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col items-start gap-2 self-start',
  },
  providers: [{ provide: FormFieldInput, useExisting: CheckboxGroupComponent }],
})
export class CheckboxGroupComponent extends FormFieldInput implements FormValueControl<any> {
  readonly value = model<any>();
  readonly label = input<string>();

  override readonly formField = inject(FormField, { optional: true, self: true });
  override readonly isInvalid = computed(
    () => this.formField?.state()?.invalid() && this.formField.state().touched(),
  );
}
