import { Component, input, output, signal } from '@angular/core';
import { Highlightable } from '@angular/cdk/a11y';

export interface TypeaheadItem {
  id: string;
  label: string;
}

let nextOptionId = 0;

/** A single result row in a `TypeaheadPanelComponent`. Implements `Highlightable` so
 * `ActiveDescendantKeyManager` (owned by `TypeaheadComponent`) can drive keyboard nav. */
@Component({
  selector: 'app-typeahead-option',
  template: '{{ item().label }}',
  host: {
    role: 'option',
    class: 'block cursor-pointer px-3 py-2 text-sm transition-colors',
    '[id]': 'id',
    '[class.bg-primary-100]': 'active()',
    '[class.dark:bg-primary-900]': 'active()',
    '[class.text-primary-900]': 'active()',
    '[class.dark:text-primary-100]': 'active()',
    '[class.hover:bg-neutral-100]': '!active()',
    '[class.dark:hover:bg-neutral-700]': '!active()',
    '[class.text-neutral-800]': '!active()',
    '[class.dark:text-neutral-100]': '!active()',
    '[attr.aria-selected]': 'active()',
    '(mousedown)': 'onMouseDown($event)',
  },
})
export class TypeaheadOptionComponent implements Highlightable {
  readonly item = input.required<TypeaheadItem>();
  readonly selected = output<TypeaheadItem>();

  readonly id = `app-typeahead-option-${nextOptionId++}`;
  readonly disabled = false;

  protected readonly active = signal(false);

  getLabel(): string {
    return this.item().label;
  }

  setActiveStyles(): void {
    this.active.set(true);
  }

  setInactiveStyles(): void {
    this.active.set(false);
  }

  protected onMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.selected.emit(this.item());
  }
}
