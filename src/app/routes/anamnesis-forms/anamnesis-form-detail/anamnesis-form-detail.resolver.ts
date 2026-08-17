import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { AnamnesisForm } from '../anamnesis-form.model';
import { AnamnesisFormService } from '../anamnesis-form.service';

export function anamnesisFormDetailResolver(): ResolveFn<AnamnesisForm> {
  return (route: ActivatedRouteSnapshot) =>
    inject(AnamnesisFormService).getById(route.paramMap.get('anamnesisFormId')!);
}
