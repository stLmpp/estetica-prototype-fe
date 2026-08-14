import { Component, inject } from '@angular/core';
import { ToastComponent } from './toast.component';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [ToastComponent],
  template: `
    <div class="flex flex-col items-end gap-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <app-toast [toast]="toast" (dismissed)="toastService.dismiss(toast.id)" />
      }
    </div>
  `,
  host: {
    'aria-live': 'polite',
  },
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
}
