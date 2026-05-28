import { booleanAttribute, Component, computed, input } from '@angular/core';

@Component({
  selector: 'button[btn]',
  host: {
    class:
      'cursor-pointer rounded-full px-6 py-2.5 font-semibold transition-colors focus:ring-2 disabled:cursor-not-allowed focus:outline-none inline-flex items-center gap-2',
    '[class.bg-primary-500]': 'btnPrimary()',
    '[class.not-disabled:hover:bg-primary-600]': 'btnPrimary()',
    '[class.not-disabled:active:bg-primary-700]': 'btnPrimary()',
    '[class.not-disabled:focus:ring-primary-400]': 'btnPrimary() || btnOutline()',
    '[class.text-white]': 'btnPrimary()',
    '[class.bg-primary-100]': 'btnSecondary()',
    '[class.not-disabled:hover:bg-primary-200]': 'btnSecondary()',
    '[class.not-disabled:active:bg-primary-300]': 'btnSecondary()',
    '[class.text-primary-800]': 'btnSecondary()',
    '[class.not-disabled:focus:ring-primary-300]': 'btnSecondary() || isDefault()',
    '[class.dark:bg-primary-900]': 'btnSecondary()',
    '[class.dark:text-primary-200]': 'btnSecondary()',
    '[class.not-disabled:dark:hover:bg-primary-800]': 'btnSecondary()',
    '[class.border-primary-500]': 'btnOutline()',
    '[class.border-2]': 'btnOutline()',
    '[class.text-primary-600]': 'btnOutline() || isDefault()',
    '[class.not-disabled:hover:bg-primary-50]': 'btnOutline() || isDefault()',
    '[class.not-disabled:active:bg-primary-100]': 'btnOutline() || isDefault()',
    '[class.dark:text-primary-300]': 'btnOutline() || isDefault()',
    '[class.not-disabled:dark:hover:bg-primary-900]': 'btnOutline() || isDefault()',
    '[class.focus:ring-offset-2]': '!isDefault()',
    '[class.disabled:opacity-50]': '!btnLoading()',
    '[class.opacity-75]': 'btnLoading()',
    '[attr.disabled]': 'disabledAttr()',
  },
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  readonly btnPrimary = input(false, {
    transform: booleanAttribute,
  });
  readonly btnSecondary = input(false, {
    transform: booleanAttribute,
  });
  readonly btnOutline = input(false, {
    transform: booleanAttribute,
  });
  readonly btnLoading = input(false, {
    transform: booleanAttribute,
  });
  readonly disabled = input(false, {
    transform: booleanAttribute,
  });

  protected readonly disabledAttr = computed(() =>
    this.btnLoading() || this.disabled() ? 'disabled' : null,
  );

  protected readonly isDefault = computed(
    () => !this.btnPrimary() && !this.btnSecondary() && !this.btnOutline(),
  );
}
