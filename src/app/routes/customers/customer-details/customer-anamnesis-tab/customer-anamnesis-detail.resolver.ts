import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { CustomerAnamnesis } from './customer-anamnesis.model';
import { CustomerAnamnesisService } from './customer-anamnesis.service';

export function customerAnamnesisDetailResolver(): ResolveFn<CustomerAnamnesis> {
  return (route: ActivatedRouteSnapshot) => {
    const customerId = route.parent?.parent?.paramMap.get('customerId');
    const customerAnamnesisId = route.paramMap.get('customerAnamnesisId')!;
    return inject(CustomerAnamnesisService).getById(customerId!, customerAnamnesisId);
  };
}
