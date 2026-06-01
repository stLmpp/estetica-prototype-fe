import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Option } from '@angular/aria/listbox';

@Component({
  selector: 'app-option',
  imports: [],
  templateUrl: './option.component.html',
  styleUrl: './option.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: Option,
      inputs: ['value', 'label', 'id', 'disabled'],
    },
  ],
  providers: [{ provide: Option, useExisting: OptionComponent }],
})
export class OptionComponent {
  readonly value = input<any>();
  readonly label = input<string>();
  readonly disabled = input(false);
  readonly id = input<string>();
}
