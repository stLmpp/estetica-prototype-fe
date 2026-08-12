import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { TypeaheadComponent, TypeaheadItem } from '../../../../../components/typeahead/typeahead.component';
import { CustomerService } from '../../../../customers/customer.service';
import { AppointmentBookingStore } from '../../appointment-booking.store';

@Component({
  selector: 'app-appointment-booking-customer-step',
  imports: [ButtonComponent, TypeaheadComponent],
  templateUrl: './customer-step.component.html',
})
export class CustomerStepComponent {
  protected readonly store = inject(AppointmentBookingStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly customerService = inject(CustomerService);

  protected readonly initialItem = computed<TypeaheadItem | null>(() => {
    const customer = this.store.customer();
    return customer ? { id: customer.id, label: customer.name } : null;
  });

  protected readonly searchFn = (query: string) =>
    this.customerService
      .list({ name: query, limit: 10 })
      .pipe(map((result) => result.items.map((customer) => ({ id: customer.id, label: customer.name }))));

  protected onItemSelected(item: TypeaheadItem | null) {
    this.store.setCustomer(item ? { id: item.id, name: item.label } : null);
  }

  protected next() {
    this.router.navigate(['../service'], { relativeTo: this.route });
  }
}
