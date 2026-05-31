import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-option',
  imports: [],
  templateUrl: './option.component.html',
  styleUrl: './option.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionComponent {
  readonly value = input<any>();
}
