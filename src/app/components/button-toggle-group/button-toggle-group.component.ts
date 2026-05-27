import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  input,
  model,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { ButtonToggleDirective } from './button-toggle.directive';

@Component({
  selector: 'app-button-toggle-group',
  template: `
    <div
      role="radiogroup"
      [attr.aria-label]="label()"
      [attr.aria-disabled]="disabled()"
      class="border-primary-300 dark:border-primary-700 inline-flex rounded-full border"
      [class.opacity-50]="disabled()"
      [class.cursor-not-allowed]="disabled()"
    >
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggleGroupComponent implements FormValueControl<any>, AfterContentInit {
  readonly value = model<any>();
  readonly label = input<string>();
  readonly disabled = input(false);

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
