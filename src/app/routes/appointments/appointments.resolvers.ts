import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { CatalogItemType } from '../catalog-items/catalog-item-type.enum';
import { CatalogItem } from '../catalog-items/catalog-item.model';
import { CatalogItemService } from '../catalog-items/catalog-item.service';
import { Employee } from '../employees/employee.model';
import { EmployeeService } from '../employees/employee.service';

const FILTER_OPTIONS_LIMIT = 100;

export function appointmentsServicesResolver(): ResolveFn<CatalogItem[]> {
  return () =>
    inject(CatalogItemService)
      .list({ itemType: CatalogItemType.Service, limit: FILTER_OPTIONS_LIMIT })
      .pipe(map((result) => result.items));
}

export function appointmentsEmployeesResolver(): ResolveFn<Employee[]> {
  return () =>
    inject(EmployeeService)
      .list({ limit: FILTER_OPTIONS_LIMIT })
      .pipe(map((result) => result.items));
}
