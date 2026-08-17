import { Injectable, signal } from '@angular/core';
import { CustomerDetail } from '../customer.model';

@Injectable()
export class CustomerDetailsStore {
  private readonly customerIdSignal = signal('');
  readonly customerId = this.customerIdSignal.asReadonly();

  private readonly customerSignal = signal<CustomerDetail | undefined>(undefined);
  readonly customer = this.customerSignal.asReadonly();

  setCustomer(customerId: string, customer: CustomerDetail) {
    this.customerIdSignal.set(customerId);
    this.customerSignal.set(customer);
  }

  patchCustomer(patch: Partial<CustomerDetail>) {
    this.customerSignal.update((customer) => (customer ? { ...customer, ...patch } : customer));
  }
}
