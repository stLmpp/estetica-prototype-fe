import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonDirective } from './components/button/button.directive';
import { ButtonToggleGroupComponent } from './components/button-toggle-group/button-toggle-group.component';
import { ButtonToggleDirective } from './components/button-toggle-group/button-toggle.directive';
import { form, FormField } from '@angular/forms/signals';

const formModel = signal({
  buttonToggle: 'corporal',
});

@Component({
  selector: 'app-root',
  imports: [ButtonDirective, ButtonToggleGroupComponent, ButtonToggleDirective, FormField],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  f = form(formModel);
}
