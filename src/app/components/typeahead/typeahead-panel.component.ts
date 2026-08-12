import { Component, input, output, viewChildren } from '@angular/core';
import { LoadingOverlayDirective } from '../loading-overlay/loading-overlay.directive';
import { TypeaheadItem, TypeaheadOptionComponent } from './typeahead-option.component';

/** Floating results list rendered inside the CDK overlay opened by `TypeaheadComponent`.
 * Split out (rather than inlined in the trigger) so its options are queryable via
 * `viewChildren` from the same place they're declared — mirrors Material's autocomplete
 * panel vs. trigger split. */
@Component({
  selector: 'app-typeahead-panel',
  imports: [LoadingOverlayDirective, TypeaheadOptionComponent],
  templateUrl: './typeahead-panel.component.html',
  host: {
    class: 'block max-h-56 w-full overflow-y-auto',
  },
})
export class TypeaheadPanelComponent {
  readonly panelId = input.required<string>();
  readonly items = input.required<TypeaheadItem[]>();
  readonly loading = input(false);
  readonly emptyMessage = input('Nenhum resultado encontrado.');

  readonly optionSelected = output<TypeaheadItem>();

  readonly optionsQuery = viewChildren(TypeaheadOptionComponent);
}
