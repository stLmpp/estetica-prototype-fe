import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'app-checkbox',
  imports: [],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Checkbox implements FormValueControl<boolean> {
  readonly value = model(false);
  readonly disabled = input(false);

  protected onChange($event: Event) {
    const target = $event.target as HTMLInputElement;
    this.value.set(target.checked);
  }
}
