import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { StepComponent } from '../../../components/stepper/step.component';
import { StepperComponent } from '../../../components/stepper/stepper.component';

interface WizardStep {
  path: string;
  label: string;
}

const STEPS: WizardStep[] = [
  { path: 'customer', label: 'Cliente' },
  { path: 'service', label: 'Serviço' },
  { path: 'professional', label: 'Profissional' },
  { path: 'schedule', label: 'Data e hora' },
  { path: 'review', label: 'Revisão' },
];

@Component({
  selector: 'app-appointment-booking',
  imports: [RouterLink, RouterOutlet, StepComponent, StepperComponent],
  templateUrl: './appointment-booking.component.html',
  host: {
    class: 'mx-auto flex max-w-3xl flex-col gap-6 p-6',
  },
})
export class AppointmentBookingComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly steps = STEPS;

  protected readonly currentStepIndex = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.computeIndexFromRouteData()),
      startWith(this.computeIndexFromRouteData()),
    ),
    { initialValue: 0 },
  );

  private computeIndexFromRouteData(): number {
    const index = this.route.snapshot.firstChild?.data['index'];
    return typeof index === 'number' ? index : 0;
  }

  protected onHeaderClick(index: number) {
    const step = this.steps[index];
    if (step) {
      this.router.navigate([step.path], { relativeTo: this.route });
    }
  }
}
