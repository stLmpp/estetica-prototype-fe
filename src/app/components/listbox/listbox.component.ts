import { Component } from '@angular/core';
import { CdkListbox } from '@angular/cdk/listbox';

/**
 * Single-select list built on `CdkListbox` — the same primitive Material's own
 * list/selection-list components are built on. Renders only a styled container;
 * selection, keyboard navigation, and ARIA wiring all come from `CdkListbox`
 * itself (inherited, same approach as `StepperComponent extends CdkStepper`).
 * Pair with `app-listbox-option` for the individual rows.
 */
@Component({
  selector: 'app-listbox',
  template: '<ng-content />',
  providers: [{ provide: CdkListbox, useExisting: ListboxComponent }],
  host: {
    class: 'flex max-h-96 flex-col gap-0.5 overflow-y-auto',
  },
})
export class ListboxComponent<T = string> extends CdkListbox<T> {}
