import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-overlay-content',
  template: `
    <div
      class="absolute inset-0 z-10 flex cursor-wait items-center justify-center bg-white/80 dark:bg-neutral-900/80"
      role="status"
      [attr.aria-label]="label()"
      (click)="$event.stopPropagation()"
    >
      <svg
        class="text-primary-500 dark:text-primary-400 h-8 w-8 animate-spin"
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
    </div>
  `,
})
export class LoadingOverlayContentComponent {
  readonly label = input('Carregando');
}
