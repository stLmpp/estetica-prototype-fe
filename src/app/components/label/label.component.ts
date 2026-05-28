import { Component, signal } from '@angular/core';

@Component({
  selector: 'label[appLabel]',
  template: `<ng-content></ng-content>
    @if (required()) {
      <span class="ml-1 text-red-500">*</span>
    }`,
  host: {
    class: 'text-sm font-semibold text-neutral-700 dark:text-neutral-300',
  },
})
export class LabelComponent {
  readonly required = signal(false);
}
