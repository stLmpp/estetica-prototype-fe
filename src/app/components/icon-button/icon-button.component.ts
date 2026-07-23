import { booleanAttribute, Component, computed, input } from '@angular/core';
import { LucideIcon } from '@lucide/angular';
import { IconComponent, IconSize } from '../icon/icon.component';

@Component({
  selector: 'button[iconBtn]',
  imports: [IconComponent],
  template: `
    @if (btnLoading()) {
      <svg
        class="animate-spin"
        [class]="spinnerSize()"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    } @else {
      <app-icon [icon]="icon()" [size]="size()" />
    }
  `,
  host: {
    class:
      'cursor-pointer rounded-full transition-colors focus:ring-2 disabled:cursor-not-allowed focus:outline-none inline-flex items-center justify-center',
    '[class.p-1.5]': 'size() === "xs"',
    '[class.p-2]': 'size() === "sm"',
    '[class.p-2.5]': 'size() === "md"',
    '[class.p-3]': 'size() === "lg"',
    '[class.p-3.5]': 'size() === "xl"',
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
    '[attr.aria-label]': 'ariaLabel()',
  },
})
export class IconButtonComponent {
  readonly icon = input.required<LucideIcon>();
  readonly size = input<IconSize>('md');
  readonly ariaLabel = input.required<string>();

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

  protected readonly spinnerSize = computed(
    () => IconButtonComponent.spinnerSizeMap[this.size()] ?? IconButtonComponent.spinnerSizeMap.md,
  );

  private static readonly spinnerSizeMap: Record<IconSize, string> = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 2-6',
    xl: 'h-8 w-8',
  };
}
