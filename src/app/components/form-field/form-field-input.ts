import { Directive, Signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';

@Directive()
export abstract class FormFieldInput {
  abstract readonly formField: FormField<any> | null;
  abstract readonly isInvalid: Signal<unknown>;
}
