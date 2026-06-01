import { ChangeDetectionStrategy, Component, computed, inject, model } from '@angular/core';
import { CdkConnectedOverlay } from '@angular/cdk/overlay';
import { FormValueControl } from '@angular/forms/signals';
import { Combobox, ComboboxInput, ComboboxPopupContainer } from '@angular/aria/combobox';
import { Listbox } from '@angular/aria/listbox';

@Component({
  selector: 'app-select',
  imports: [CdkConnectedOverlay, Combobox, ComboboxPopupContainer, ComboboxInput],
  templateUrl: './select.component.html',
  styleUrl: './select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: Listbox,
      inputs: ['values: value', 'multi', 'disabled', 'readonly'],
      outputs: ['valuesChange: valueChange'],
    },
  ],
})
// TODO https://angular.dev/guide/aria/select
export class SelectComponent implements FormValueControl<any> {
  readonly value = model<any>();
  listbox = inject(Listbox);
  labels = [
    { value: 'Important', icon: 'label' },
    { value: 'Starred', icon: 'star' },
    { value: 'Work', icon: 'work' },
    { value: 'Personal', icon: 'person' },
    { value: 'To Do', icon: 'checklist' },
    { value: 'Later', icon: 'schedule' },
    { value: 'Read', icon: 'menu_book' },
    { value: 'Travel', icon: 'flight' },
  ];
  displayIcon = computed(() => {
    const values = this.listbox?.values() || [];
    const label = this.labels.find((label) => label.value === values[0]);
    return label ? label.icon : '';
  });
  displayValue = computed(() => {
    const values = this.listbox?.values() || [];
    return values.length ? values[0] : 'Select a label';
  });
}
