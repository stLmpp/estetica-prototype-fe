import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { StepComponent } from '../../../components/stepper/step.component';
import { StepperComponent } from '../../../components/stepper/stepper.component';
import { AppointmentBookingStore } from './appointment-booking.store';

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
  providers: [AppointmentBookingStore],
})
export class AppointmentBookingComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly steps = STEPS;

  // TODO(claude) Add the INDEX to the route data instead of checking for url.includes path
  protected readonly currentStepIndex = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.computeIndexFromUrl()),
      startWith(this.computeIndexFromUrl()),
    ),
    { initialValue: 0 },
  );

  private computeIndexFromUrl(): number {
    const index = this.steps.findIndex((step) => this.router.url.includes(`/${step.path}`));
    return index === -1 ? 0 : index;
  }

  protected onHeaderClick(index: number) {
    const step = this.steps[index];
    if (step) {
      this.router.navigate([step.path], { relativeTo: this.route });
    }
  }
}
