import { afterNextRender, ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from './components/button/button.component';
import { ButtonToggleGroupComponent } from './components/button-toggle-group/button-toggle-group.component';
import { ButtonToggleDirective } from './components/button-toggle-group/button-toggle.directive';
import { debounce, form, FormField, required } from '@angular/forms/signals';
import { BadgeComponent } from './components/badge/badge.component';
import { ChipComponent } from './components/chip/chip.component';
import { InputDirective } from './components/input/input.directive';
import { FormFieldComponent } from './components/form-field/form-field.component';
import { LabelComponent } from './components/label/label.component';
import { HintComponent } from './components/hint/hint.component';

const formModel = signal<{ buttonToggle: string; name: string; select: { id: number } }>({
  buttonToggle: 'corporal',
  name: '',
  select: { id: 1 },
});

@Component({
  selector: 'app-root',
  imports: [
    ButtonComponent,
    ButtonToggleGroupComponent,
    ButtonToggleDirective,
    FormField,
    BadgeComponent,
    ChipComponent,
    InputDirective,
    FormFieldComponent,
    LabelComponent,
    HintComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
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
