import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  inject,
  input,
  model,
} from '@angular/core';
import { FormField, FormValueControl } from '@angular/forms/signals';
import { FormFieldInput } from '../form-field/form-field-input';
import { ButtonToggleDirective } from './button-toggle.directive';

@Component({
  selector: 'app-button-toggle-group',
  template: `
    @if (label(); as label) {
      <span class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{{ label }}</span>
    }
    <div
      class="border-primary-300 dark:border-primary-700 inline-flex rounded-full border"
      role="radiogroup"
      [attr.aria-label]="label()"
      [attr.aria-disabled]="disabled()"
      [class.opacity-50]="disabled()"
      [class.cursor-not-allowed]="disabled()"
    >
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col items-start gap-2 self-start',
  },
  providers: [{ provide: FormFieldInput, useExisting: ButtonToggleGroupComponent }],
})
export class ButtonToggleGroupComponent
  extends FormFieldInput
  implements FormValueControl<any>, AfterContentInit
{
  readonly value = model<any>();
  readonly label = input<string>();
  readonly disabled = input(false);

  override readonly formField = inject(FormField, { optional: true, self: true });
  override readonly isInvalid = computed(
    () => this.formField?.state()?.invalid() && this.formField.state().touched(),
  );

  readonly toggles = contentChildren(ButtonToggleDirective);

  selectNext(current: ButtonToggleDirective) {
    const toggles = this.toggles();
    const index = toggles.indexOf(current);
    const length = toggles.length;
    let nextToggle: ButtonToggleDirective | undefined = undefined;
    let nextIncrease = 1;
    while (nextIncrease < length) {
      const toggle = toggles[(index + nextIncrease) % length];
      if (!toggle) {
        break;
      }
      if (toggle?.isDisabled()) {
        nextIncrease++;
        continue;
      }
      nextToggle = toggle;
      break;
    }
    nextToggle?.focus();
  }

  selectPrevious(current: ButtonToggleDirective) {
    const toggles = this.toggles();
    const index = toggles.indexOf(current);
    const length = toggles.length;
    let prevToggle: ButtonToggleDirective | undefined = undefined;
    let prevDecrease = 1;
    while (prevDecrease < length) {
      const toggle = toggles.at(index - prevDecrease);
      if (!toggle) {
        break;
      }
      if (toggle.isDisabled()) {
        prevDecrease++;
        continue;
      }
      prevToggle = toggle;
      break;
    }
    prevToggle?.focus();
  }

  ngAfterContentInit() {
    if (this.value()) {
      return;
    }
    this.toggles()[0]?.select();
  }
}
