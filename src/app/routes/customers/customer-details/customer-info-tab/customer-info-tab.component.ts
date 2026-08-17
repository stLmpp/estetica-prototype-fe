import { Component, inject } from '@angular/core';
import { CustomerInfoFormComponent } from '../customer-info-form/customer-info-form.component';
import { CustomerDetailsStore } from '../customer-details.store';

@Component({
  selector: 'app-customer-info-tab',
  imports: [CustomerInfoFormComponent],
  template: `
    @if (store.customer(); as customer) {
      <app-customer-info-form
        [customerId]="store.customerId()"
        [customer]="customer"
        (saved)="store.patchCustomer($event)"
      />
    }
  `,
})
export class CustomerInfoTabComponent {
  protected readonly store = inject(CustomerDetailsStore);
}
