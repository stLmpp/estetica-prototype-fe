import { Component, computed, input, output } from '@angular/core';
import {
  LucideCircleCheck,
  LucideCircleX,
  LucideIcon,
  LucideInfo,
  LucideTriangleAlert,
  LucideX,
} from '@lucide/angular';
import { IconColor, IconComponent } from '../icon/icon.component';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { ToastItem, ToastVariant } from './toast.model';

const ICON_BY_VARIANT: Record<ToastVariant, LucideIcon> = {
  success: LucideCircleCheck,
  error: LucideCircleX,
  warning: LucideTriangleAlert,
  info: LucideInfo,
};

const ICON_COLOR_BY_VARIANT: Record<ToastVariant, IconColor> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

const CARD_CLASS_BY_VARIANT: Record<ToastVariant, string> = {
  success:
    'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-200',
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900 dark:text-red-200',
  warning:
    'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

@Component({
  selector: 'app-toast',
  imports: [IconButtonComponent, IconComponent],
  templateUrl: './toast.component.html',
  host: {
    class: 'flex w-full max-w-sm items-start gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg',
    '[class]': 'cardClass()',
    '[attr.role]': 'role()',
  },
})
export class ToastComponent {
  readonly toast = input.required<ToastItem>();
  readonly dismissed = output<void>();

  protected readonly LucideX = LucideX;

  protected readonly icon = computed(() => ICON_BY_VARIANT[this.toast().variant]);
  protected readonly iconColor = computed(() => ICON_COLOR_BY_VARIANT[this.toast().variant]);
  protected readonly cardClass = computed(() => CARD_CLASS_BY_VARIANT[this.toast().variant]);
  protected readonly role = computed(() => (this.toast().variant === 'error' ? 'alert' : 'status'));
}
