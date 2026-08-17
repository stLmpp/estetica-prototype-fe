import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { CustomerDetail } from '../customer.model';
import { CustomerService } from '../customer.service';

export function customerDetailsResolver(): ResolveFn<CustomerDetail> {
  return (route: ActivatedRouteSnapshot) =>
    inject(CustomerService).getById(route.paramMap.get('customerId')!);
}
