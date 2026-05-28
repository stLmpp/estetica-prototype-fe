import { computed, Directive, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { FormFieldInput } from '../form-field/form-field-input';

@Directive({
  selector: 'input[appInput]',
  host: {
    class:
      'focus:ring-primary-400 focus:border-primary-400 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 transition focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-300',
    '[class.border-red-400]': 'isInvalid()',
    '[class.focus:ring-red-300]': 'isInvalid()',
    '[class.dark:border-red-500]': 'isInvalid()',
    '[class.border-transparent]': '!isInvalid()',
  },
  providers: [{ provide: FormFieldInput, useExisting: InputDirective }],
})
export class InputDirective extends FormFieldInput {
  readonly formField = inject(FormField, { optional: true, self: true });

  readonly isInvalid = computed(
    () => this.formField?.state()?.invalid() && this.formField.state().touched(),
  );
}
