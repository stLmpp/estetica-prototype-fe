import { afterNextRender, ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from './components/button/button.component';
import { ButtonToggleGroupComponent } from './components/button-toggle-group/button-toggle-group.component';
import { ButtonToggleDirective } from './components/button-toggle-group/button-toggle.directive';
import { form, FormField } from '@angular/forms/signals';
import { Badge } from './components/badge/badge.component';
import { Chip } from './components/chip/chip.component';

const formModel = signal({
  buttonToggle: 'corporal',
});

@Component({
  selector: 'app-root',
  imports: [
    ButtonComponent,
    ButtonToggleGroupComponent,
    ButtonToggleDirective,
    FormField,
    Badge,
    Chip,
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

  f = form(formModel, (schema) => {
    // disabled(schema.buttonToggle);
  });

  readonly theme = signal('light');

  protected toggleTheme() {
    document.documentElement.classList.toggle('dark');
  }

  protected removeChip() {
    console.log('remove chip');
  }
}
