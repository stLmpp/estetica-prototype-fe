import { afterNextRender, Component, signal } from '@angular/core';
import { BadgeComponent } from './components/badge/badge.component';
import { ButtonComponent } from './components/button/button.component';
import { ButtonToggleDirective } from './components/button-toggle-group/button-toggle.directive';
import { ButtonToggleGroupComponent } from './components/button-toggle-group/button-toggle-group.component';
import { ChipComponent } from './components/chip/chip.component';
import { FormFieldComponent } from './components/form-field/form-field.component';
import { HintComponent } from './components/hint/hint.component';
import { InputDirective } from './components/input/input.directive';
import { LabelComponent } from './components/label/label.component';
import { debounce, form, FormField, required } from '@angular/forms/signals';
import { SelectComponent } from './components/select/select.component';
import { OptionComponent } from './components/option/option.component';

const formModel = signal<{ buttonToggle: string; name: string; select: { id: number } }>({
  buttonToggle: 'corporal',
  name: '',
  select: { id: 1 },
});

@Component({
  selector: 'app-ds',
  imports: [
    BadgeComponent,
    ButtonComponent,
    ButtonToggleDirective,
    ButtonToggleGroupComponent,
    ChipComponent,
    FormFieldComponent,
    HintComponent,
    InputDirective,
    LabelComponent,
    FormField,
    SelectComponent,
    OptionComponent,
  ],
  templateUrl: './ds.component.html',
  styles: `
    :host {
      display: block;

      margin-top: 2rem;
      margin-left: 2rem;
    }

    .buttons {
      button {
        margin-right: 1rem;
      }
    }

    section {
      margin-bottom: 1rem;
    }
  `,
})
export class DsComponent {
  constructor() {
    afterNextRender(() => {
      this.theme.set(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });
  }

  readonly options = [{ id: 1 }, { id: 2 }, { id: 3 }];

  readonly compareWith = (o1: { id: number }, o2: { id: number }) => o1.id === o2.id;

  readonly f = form(formModel, (schema) => {
    // disabled(schema.buttonToggle);
    required(schema.name, { message: 'Name is required' });
    debounce(schema.name, 300);
  });

  readonly theme = signal('light');

  protected toggleTheme() {
    document.documentElement.classList.toggle('dark');
  }

  protected removeChip() {
    console.log('remove chip');
  }
}
