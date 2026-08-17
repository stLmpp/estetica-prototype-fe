import { Component, inject } from '@angular/core';
import { CustomerPhonesFormComponent } from '../customer-phones-form/customer-phones-form.component';
import { CustomerDetailsStore } from '../customer-details.store';

@Component({
  selector: 'app-customer-phones-tab',
  imports: [CustomerPhonesFormComponent],
  template: `
    <app-customer-phones-form
      [customerId]="store.customerId()"
      [phones]="store.customer()?.phones"
      (saved)="store.patchCustomer({ phones: $event })"
    />
  `,
})
export class CustomerPhonesTabComponent {
  protected readonly store = inject(CustomerDetailsStore);
}
