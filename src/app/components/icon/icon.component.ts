import { Component, computed, input } from '@angular/core';
import { LucideDynamicIcon, LucideIcon } from '@lucide/angular';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconColor =
  'primary' | 'neutral' | 'success' | 'error' | 'warning' | 'info' | 'white' | 'inherit';

@Component({
  selector: 'app-icon',
  imports: [LucideDynamicIcon],
  template: `
    <svg
      [class]="colorClass()"
      [lucideIcon]="icon()"
      [size]="pixelSize()"
      [strokeWidth]="strokeWidth()"
    ></svg>
  `,
  host: {
    class: 'inline-flex',
  },
})
export class IconComponent {
  private static readonly sizeMap: Record<IconSize, number> = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  };

  readonly icon = input.required<LucideIcon>();
  readonly size = input<IconSize>('md');
  readonly color = input<IconColor>('inherit');
  readonly strokeWidth = input<number>(2);

  protected readonly pixelSize = computed(
    () => IconComponent.sizeMap[this.size()] ?? IconComponent.sizeMap.md,
  );

  protected readonly colorClass = computed(() => {
    switch (this.color()) {
      case 'primary':
        return 'text-primary-500 dark:text-primary-400';
      case 'neutral':
        return 'text-neutral-500 dark:text-neutral-400';
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      case 'white':
        return 'text-white';
      case 'inherit':
      default:
        return 'text-inherit';
    }
  });
}
