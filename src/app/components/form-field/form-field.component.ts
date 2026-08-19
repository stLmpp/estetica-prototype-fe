import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  inject,
} from '@angular/core';
import { FormFieldInput } from './form-field-input';
import { LabelComponent } from '../label/label.component';

@Component({
  selector: 'app-form-field',
  imports: [],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-2',
  },
})
export class FormFieldComponent implements AfterContentInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  constructor() {
    effect(() => {
      this.label()?.required.set(!!this.input()?.formField?.state().required());
    });
  }

  protected readonly label = contentChild(LabelComponent);
  protected readonly input = contentChild(FormFieldInput);

  protected readonly firstError = computed(() => this.input()?.formField?.state().errors()[0]);

  ngAfterContentInit() {
    if (!this.input()) {
      throw new Error(
        `<app-form-field> requires a projected FormFieldInput ` +
          `(input[appInput], select[appSelect], app-checkbox or app-switch), ` +
          `found none in: ${this.elementRef.nativeElement.outerHTML}`,
      );
    }
  }
}
