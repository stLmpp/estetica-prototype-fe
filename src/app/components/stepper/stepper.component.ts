import { Component, output, signal } from '@angular/core';
import { CdkStep, CdkStepHeader, CdkStepper } from '@angular/cdk/stepper';
import { takeUntil } from 'rxjs';

/**
 * Header-only stepper built on `CdkStepper`/`CdkStep` for the indicator row
 * (numbered circles, connecting lines, labels, keyboard nav between
 * headers). Deliberately does not render `CdkStep` content: it's meant to
 * sit above a routed `<router-outlet>` where each step is its own page, not
 * content projected into the stepper itself. Drive `[selectedIndex]` from
 * the active route and react to `(selectionChange)` to navigate.
 */
@Component({
  selector: 'app-stepper',
  imports: [CdkStepHeader],
  templateUrl: './stepper.component.html',
  providers: [{ provide: CdkStepper, useExisting: StepperComponent }],
  host: {
    class: 'block',
  },
})
export class StepperComponent extends CdkStepper {
  /**
   * Emitted when a navigable header is clicked. `selectedIndex` is driven
   * one-way from outside (e.g. the active route) — this component never
   * mutates it itself, so there's a single source of truth and no feedback
   * loop between route navigation and the header's own selection state.
   */
  readonly headerClick = output<number>();

  protected readonly stepsSignal = signal<CdkStep[]>([]);

  override ngAfterContentInit() {
    super.ngAfterContentInit();
    this.stepsSignal.set(this.steps.toArray());
    this.steps.changes.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this.stepsSignal.set(this.steps.toArray());
    });
  }

  protected onHeaderClick(index: number) {
    if (!this.steps.get(index)?.isNavigable()) {
      return;
    }
    this.headerClick.emit(index);
  }
}
