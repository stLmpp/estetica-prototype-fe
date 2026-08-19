import { Component, inject } from '@angular/core';
import { ToastComponent } from './toast.component';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [ToastComponent],
  template: `
    <div class="flex flex-col items-end gap-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <app-toast
          animate.enter="toast-enter"
          animate.leave="toast-leave"
          [toast]="toast"
          (dismissed)="toastService.dismiss(toast.id)"
        />
      }
    </div>
  `,
  styles: `
    .toast-enter {
      animation: toast-enter 200ms ease-out;
    }
    .toast-leave {
      animation: toast-leave 150ms ease-in forwards;
    }
    @keyframes toast-enter {
      from {
        opacity: 0;
        transform: translateX(16px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @keyframes toast-leave {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(16px);
      }
    }
  `,
  host: {
    'aria-live': 'polite',
  },
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
}
