import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { FormCheckboxControl, FormField } from '@angular/forms/signals';
import { FormFieldInput } from '../form-field/form-field-input';
import { FocusOptions } from '@angular/cdk/a11y';

@Component({
  selector: 'app-checkbox',
  imports: [],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: FormFieldInput, useExisting: CheckboxComponent }],
})
export class CheckboxComponent extends FormFieldInput implements FormCheckboxControl {
  readonly checked = model(false);
  readonly disabled = input(false);
  readonly touched = model(false);

  override readonly formField = inject(FormField, { optional: true, self: true });
  override readonly isInvalid = computed(
    () => this.formField?.state()?.invalid() && this.formField.state().touched(),
  );

  readonly label = viewChild<ElementRef<HTMLLabelElement>>('label');

  protected onChange($event: Event) {
    const target = $event.target as HTMLInputElement;
    this.checked.set(target.checked);
  }

  protected onLabelClick() {
    this.touched.set(true);
  }

  focus(options?: FocusOptions) {
    this.label()?.nativeElement.focus(options);
  }

  protected onLabelKeydown() {
    this.touched.set(true);
  }
}
