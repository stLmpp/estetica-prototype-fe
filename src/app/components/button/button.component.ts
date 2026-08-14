import { booleanAttribute, Component, computed, input, numberAttribute } from '@angular/core';
import { debouncedShow } from '../../shared/debounced-show';

const DEFAULT_SHOW_DELAY_MS = 200;

@Component({
  selector: 'button[btn],a[btn]',
  host: {
    class:
      'cursor-pointer rounded-full px-6 py-2.5 font-semibold transition-colors focus:ring-2 focus:outline-none inline-flex items-center gap-2',
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
    '[class.opacity-50]': 'isDisabled() && !btnLoading()',
    '[class.opacity-75]': 'btnLoading()',
    '[class.cursor-not-allowed]': 'isDisabled()',
    '[class.pointer-events-none]': 'isDisabled()',
    '[attr.disabled]': 'disabledAttr()',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.tabindex]': 'isDisabled() ? -1 : null',
    '(click)': 'onClick($event)',
    '(keydown.enter)': 'onDisabledKeydown($event)',
    '(keydown.space)': 'onDisabledKeydown($event)',
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
  readonly btnLoadingShowDelay = input(DEFAULT_SHOW_DELAY_MS, {
    transform: (value: unknown) => {
      const newValue = numberAttribute(value, DEFAULT_SHOW_DELAY_MS);
      return newValue < 0 ? DEFAULT_SHOW_DELAY_MS : newValue;
    },
  });
  readonly disabled = input(false, {
    transform: booleanAttribute,
  });

  // `disabled` on a native `<button>` is enough on its own: the browser blocks
  // clicks/keyboard activation and matches `:disabled` for the Tailwind
  // `disabled:` variants above. None of that applies to `<a>` — anchors have
  // no disabled state, and RouterLink's own click handler doesn't check
  // `event.defaultPrevented`, so it navigates regardless of what this
  // component's own click handler does. `pointer-events-none` (blocks mouse
  // interaction before any click event is even dispatched, sidestepping
  // listener-order entirely), a keydown guard (blocks Enter/Space — the
  // browser synthesizes a click from these unless the keydown itself is
  // prevented), and dropping the element from the tab order together are
  // what make `disabled` actually block an `a[btn]`, not just look disabled.
  protected readonly isDisabled = computed(() => this.btnLoading() || this.disabled());

  protected readonly disabledAttr = computed(() => (this.isDisabled() ? 'disabled' : null));

  private readonly debouncedBtnLoading = debouncedShow(this.btnLoading, () =>
    this.btnLoadingShowDelay(),
  );

  protected readonly showSpinner = computed(() => this.debouncedBtnLoading.value());

  protected readonly isDefault = computed(
    () => !this.btnPrimary() && !this.btnSecondary() && !this.btnOutline(),
  );

  protected onClick(event: Event) {
    if (this.isDisabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  protected onDisabledKeydown(event: Event) {
    if (this.isDisabled()) {
      event.preventDefault();
    }
  }
}
