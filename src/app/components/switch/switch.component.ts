import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { FormFieldInput } from '../form-field/form-field-input';

@Component({
  selector: 'app-switch',
  imports: [],
  templateUrl: './switch.component.html',
  styleUrl: './switch.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: FormFieldInput, useExisting: SwitchComponent }],
})
export class SwitchComponent extends CheckboxComponent {}
