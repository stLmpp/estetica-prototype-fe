import { Component } from '@angular/core';
import { CdkStep } from '@angular/cdk/stepper';

/**
 * Thin `app-step` alias over `CdkStep`. Its own content is never rendered —
 * `StepperComponent` only reads `label`/`isSelected`/`isNavigable` from it to
 * draw the header. The actual step body is rendered elsewhere via a routed
 * `<router-outlet>`, not through `CdkStep`'s content projection.
 */
@Component({
  selector: 'app-step',
  template: '',
  providers: [{ provide: CdkStep, useExisting: StepComponent }],
})
export class StepComponent extends CdkStep {}
