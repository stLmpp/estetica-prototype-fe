import { afterNextRender, Component, computed, signal } from '@angular/core';
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
import { StringPipe } from './shared/string.pipe';
import { SelectDirective } from './components/select/select.directive';
import { JsonPipe } from '@angular/common';

const formModel = signal<{ buttonToggle: string; name: string; select: string }>({
  buttonToggle: 'corporal',
  name: '',
  select: '1',
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
    StringPipe,
    SelectDirective,
    JsonPipe,
  ],
  templateUrl: './ds.component.html',
  styles: `
    :host {
      display: block;

      margin-top: 2rem;
      margin-left: 2rem;
      margin-right: 2rem;
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

  readonly f = form(formModel, (schema) => {
    // disabled(schema.buttonToggle);
    required(schema.name, { message: 'Name is required' });
    debounce(schema.name, 300);
  });

  readonly selectValueObject = computed(() =>
    this.options.find((option) => String(option.id) === this.f.select().value()),
  );

  readonly theme = signal('light');

  protected toggleTheme() {
    document.documentElement.classList.toggle('dark');
  }

  protected removeChip() {
    console.log('remove chip');
  }
}
