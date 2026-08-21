import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { CustomerFollowupService } from './customer-followup.service';

export function customerFollowupOwnershipGuard(): CanActivateFn {
  return (route) => {
    const router = inject(Router);
    const customerFollowupService = inject(CustomerFollowupService);
    const customerId = route.parent?.parent?.paramMap.get('customerId')!;
    const customerFollowupId = route.paramMap.get('customerFollowupId')!;

    return customerFollowupService.getById(customerFollowupId).pipe(
      map((record) =>
        record.customerId === customerId
          ? true
          : router.createUrlTree(['/customers', customerId, 'follow-up']),
      ),
      catchError(() => of(router.createUrlTree(['/customers', customerId, 'follow-up']))),
    );
  };
}
