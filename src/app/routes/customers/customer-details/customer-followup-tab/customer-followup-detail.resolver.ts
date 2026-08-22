import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { CustomerFollowup } from './customer-followup.model';
import { CustomerFollowupService } from './customer-followup.service';

export function customerFollowupDetailResolver(): ResolveFn<CustomerFollowup> {
  return (route: ActivatedRouteSnapshot) => {
    const customerFollowupId = route.paramMap.get('customerFollowupId')!;
    return inject(CustomerFollowupService).getById(customerFollowupId);
  };
}
