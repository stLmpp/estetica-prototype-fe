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
import { debounce, form, FormField, required, validate } from '@angular/forms/signals';
import { StringPipe } from './shared/string.pipe';
import { SelectDirective } from './components/select/select.directive';
import { JsonPipe } from '@angular/common';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { SwitchComponent } from './components/switch/switch.component';
import { ColDef } from './components/table/model/col-def';
import { TableComponent } from './components/table/table.component';

const formModel = signal({
  buttonToggle: 'corporal',
  name: '',
  select: '1',
  check: false,
  switch: true,
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
    CheckboxComponent,
    SwitchComponent,
    TableComponent,
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
    validate(schema.check, ({ value }) => {
      console.log({ value: value() });
      if (value()) {
        return null;
      }
      return {
        kind: 'requireTrue',
        message: 'Checkbox must be checked',
      };
    });
  });

  readonly columns: ColDef[] = [
    {
      key: 'id',
      title: 'Id',
    },
    {
      key: 'name',
      title: 'Name',
    },
  ];

  readonly data: any[] = [
    {
      id: 1,
      name: 'John Doe',
    },
    {
      id: 2,
      name: 'Jane Doe',
    },
    {
      id: 3,
      name: 'Bob Doe',
    },
    {
      id: 4,
      name: 'Alice Doe',
    },
    {
      id: 5,
      name: 'Charlie Doe',
    },
  ];

  readonly trackBy = (value: any) => value.id;

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
