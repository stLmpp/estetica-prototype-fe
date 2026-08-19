import { Component } from '@angular/core';
import { CdkOption } from '@angular/cdk/listbox';

@Component({
  selector: 'app-listbox-option',
  template: '<ng-content />',
  providers: [{ provide: CdkOption, useExisting: ListboxOptionComponent }],
  host: {
    class:
      'cursor-pointer rounded-lg px-3 py-2 text-sm text-neutral-800 transition-colors dark:text-neutral-100',
    '[class.bg-primary-100]': 'isSelected()',
    '[class.dark:bg-primary-900]': 'isSelected()',
    '[class.hover:bg-neutral-100]': '!isSelected()',
    '[class.dark:hover:bg-neutral-700]': '!isSelected()',
  },
})
export class ListboxOptionComponent<T = string> extends CdkOption<T> {}
