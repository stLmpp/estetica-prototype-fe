import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  input,
  model,
  untracked,
} from '@angular/core';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { OptionComponent } from '../option/option.component';
import { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'app-select',
  imports: [CdkOverlayOrigin, CdkConnectedOverlay],
  templateUrl: './select.component.html',
  styleUrl: './select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// TODO https://angular.dev/guide/aria/select
export class SelectComponent implements FormValueControl<any> {
  constructor() {
    effect(() => {
      this.optionsMap.clear();
      const keyGetter = this.keyGetter();
      for (const option of this.options()) {
        this.optionsMap.set(keyGetter(option.value()), option);
      }
    });

    effect(() => {
      const value = this.value();
      if (!value) {
        return;
      }
      if (typeof value === 'object') {
        return;
      }
      const keyGetter = this.keyGetter();
      const option = this.optionsMap.get(keyGetter(value));
      untracked(() => this.value.set(option?.value()));
    });
  }

  readonly value = model<any>();
  readonly key = input<string | symbol | number | ((value: any) => any)>('id');
  private readonly keyGetter = computed(() => {
    const key = this.key();
    if (typeof key === 'function') {
      return key;
    }
    return (value: any) => value[key];
  });

  private readonly options = contentChildren(OptionComponent);

  private readonly optionsMap = new Map<any, OptionComponent>();
}
