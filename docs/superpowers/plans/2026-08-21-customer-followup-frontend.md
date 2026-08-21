# CustomerFollowup Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `customer-followup-tab` (list, create/edit form, detail view) inside `customer-details`, closing FE-7.

**Architecture:** Mirrors `customer-anamnesis-tab`'s full-CRUD structure (model/dto/service/store split, `NgRx SignalStore`, nested `new`/`:id`/`:id/edit` routes, table list, shared form-page). The create/edit form's items sub-form mirrors `sale-form`'s items array. The appointment/sale pickers use plain `<select>` dropdowns (not `app-typeahead`) with a "sale drives appointment" relationship that makes the backend's cross-field mismatch rule structurally unreachable from the UI.

**Tech Stack:** Angular 22 (standalone components, Signal Forms `@angular/forms/signals`), `@ngrx/signals` (SignalStore, entities, rxMethod), RxJS, `dayjs/esm`, `big.js`, Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-08-21-customer-followup-frontend-design.md`

## Global Constraints

- All routes hit the flat `/v1/customer-followup` API (query-param `customerId`, not nested `/customer/:id/...`).
- `priceApplied` on every item is **always required** on input (`/^\d{1,8}(\.\d{1,2})?$/`), even when `catalogItemId` is set — no auto-pricing lookup, unlike `sale`.
- `PATCH` `appointmentId`/`saleId`: omit key = unchanged, `null` = explicitly clear, string = set. `items` provided at all = wholesale replace.
- `member` role: `customerFollowup: ['get']` only. `owner`/`admin`: full `['get', 'create', 'update', 'delete']`.
- No method calls inside templates — derive display data via `computed()` into plain arrays/objects, `@for`/`@if` over those, per `docs/CONVENTIONS.md`.
- Submit buttons disable on `f().invalid() || f().submitting() || (isEditing() && !f().dirty())` (dual-purpose forms only include the third clause).
- Run `pnpm format` then `pnpm lint` (in that order) as the final step of this whole feature, not after every task.
- This codebase has no unit-test or e2e framework wired up for route/feature components (verified: `customer-anamnesis-tab`, `sale-form`, and every other full-CRUD tab have zero `.spec.ts` files). Each task's verification step is `pnpm build` (full type-check) plus, where the task changes visible behavior, manual verification through the dev server — not a TDD unit-test cycle, to stay consistent with established codebase practice.
- **After all tasks below are complete and verified, stop and let the user review the code themselves before invoking `superpowers:requesting-code-review`.** Do not proceed to that skill until the user confirms.

---

## File Structure

All new files under `src/app/routes/customers/customer-details/customer-followup-tab/`:

- `customer-followup.model.ts` — `CustomerFollowup`, `CustomerFollowupListItem`, `CustomerFollowupItem`.
- `customer-followup.dto.ts` — payloads, filter/result types.
- `customer-followup.service.ts` — HTTP calls to `/v1/customer-followup`.
- `customer-followup-tab.store.ts` — `NgRx SignalStore`, paginated entity list.
- `customer-followup-ownership.guard.ts` — `CanActivateFn` verifying a fetched record's `customerId` matches the route.
- `customer-followup-detail.resolver.ts` — `ResolveFn` fetching the full record for detail/edit routes.
- `customer-followup-tab.component.ts` / `.html` — list view.
- `customer-followup-form-page/customer-followup-form-page.component.ts` / `.html` — shared create/edit form.
- `customer-followup-detail-page/customer-followup-detail-page.component.ts` / `.html` — detail view.

Modified files:

- `src/app/routes/customers/customer.routes.ts` — new `follow-up` route block.
- `src/app/routes/customers/customer-details/customer-details.component.ts` — new tab entry.
- `src/app/core/auth/organization-access-control.ts` — new `customerFollowup` resource.
- `TODO.md` / `TODO_DONE.md` (this repo) — move FE-7, add FE-26.
- `estetica-prototype-api/TODO.md` (sibling repo) — add BE-32 (paired item).

---

### Task 1: Data layer — model, DTO, service

**Files:**
- Create: `src/app/routes/customers/customer-details/customer-followup-tab/customer-followup.model.ts`
- Create: `src/app/routes/customers/customer-details/customer-followup-tab/customer-followup.dto.ts`
- Create: `src/app/routes/customers/customer-details/customer-followup-tab/customer-followup.service.ts`

**Interfaces:**
- Produces: `CustomerFollowup { id, customerId, text, date, appointmentId?, saleId?, items: CustomerFollowupItem[] }`, `CustomerFollowupListItem { id, customerId, text, date, appointmentId?, saleId? }`, `CustomerFollowupItem { id, description, catalogItemId?, catalogItemName?, quantity, priceApplied }`, `CustomerFollowupItemPayload { description, catalogItemId?, quantity?, priceApplied }`, `CreateCustomerFollowupPayload { customerId, text, date?, appointmentId?, saleId?, items? }`, `UpdateCustomerFollowupPayload { text?, date?, appointmentId?: string|null, saleId?: string|null, items? }`, `ListCustomerFollowupFilter { customerId, page?, limit? }`, `ListCustomerFollowupResult { items: CustomerFollowupListItem[], meta: PaginationMetadata }`, `CustomerFollowupService` with `list/getById/create/update/delete`.

- [ ] **Step 1: Write the model**

```ts
// customer-followup.model.ts
export interface CustomerFollowupItem {
  id: string;
  description: string;
  catalogItemId?: string;
  catalogItemName?: string;
  quantity: number;
  priceApplied: string;
}

export interface CustomerFollowup {
  id: string;
  customerId: string;
  text: string;
  date: string;
  appointmentId?: string;
  saleId?: string;
  items: CustomerFollowupItem[];
}

export interface CustomerFollowupListItem {
  id: string;
  customerId: string;
  text: string;
  date: string;
  appointmentId?: string;
  saleId?: string;
}
```

- [ ] **Step 2: Write the DTOs**

```ts
// customer-followup.dto.ts
import { PaginationMetadata } from '../../../../shared/pagination.model';
import { CustomerFollowupListItem } from './customer-followup.model';

export interface CustomerFollowupItemPayload {
  description: string;
  catalogItemId?: string;
  quantity?: number;
  priceApplied: string;
}

export interface CreateCustomerFollowupPayload {
  customerId: string;
  text: string;
  date?: string;
  appointmentId?: string;
  saleId?: string;
  items?: CustomerFollowupItemPayload[];
}

export interface UpdateCustomerFollowupPayload {
  text?: string;
  date?: string;
  appointmentId?: string | null;
  saleId?: string | null;
  items?: CustomerFollowupItemPayload[];
}

export interface ListCustomerFollowupFilter {
  customerId: string;
  page?: number;
  limit?: 10 | 25 | 50 | 100;
}

export interface ListCustomerFollowupResult {
  items: CustomerFollowupListItem[];
  meta: PaginationMetadata;
}
```

- [ ] **Step 3: Write the service**

```ts
// customer-followup.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { httpParamsFromObject } from '../../../../shared/http-params-from-object';
import { PaginationMetadata } from '../../../../shared/pagination.model';
import {
  CreateCustomerFollowupPayload,
  ListCustomerFollowupFilter,
  ListCustomerFollowupResult,
  UpdateCustomerFollowupPayload,
} from './customer-followup.dto';
import { CustomerFollowup, CustomerFollowupListItem } from './customer-followup.model';

interface CustomerFollowupResponse {
  data: { customerFollowup: CustomerFollowup };
}

interface ListCustomerFollowupResponse {
  data: { items: CustomerFollowupListItem[] };
  meta: PaginationMetadata;
}

@Service()
export class CustomerFollowupService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api}/v1/customer-followup`;

  list(filter: ListCustomerFollowupFilter) {
    const params = httpParamsFromObject({
      customerId: filter.customerId,
      page: filter.page,
      limit: filter.limit,
    });
    return this.http.get<ListCustomerFollowupResponse>(this.baseUrl, { params }).pipe(
      map(
        (response): ListCustomerFollowupResult => ({
          items: response.data.items,
          meta: response.meta,
        }),
      ),
    );
  }

  getById(customerFollowupId: string) {
    return this.http
      .get<CustomerFollowupResponse>(`${this.baseUrl}/${customerFollowupId}`)
      .pipe(map((response) => response.data.customerFollowup));
  }

  create(payload: CreateCustomerFollowupPayload) {
    return this.http
      .post<CustomerFollowupResponse>(this.baseUrl, { customerFollowup: payload })
      .pipe(map((response) => response.data.customerFollowup));
  }

  update(customerFollowupId: string, payload: UpdateCustomerFollowupPayload) {
    return this.http.patch<void>(`${this.baseUrl}/${customerFollowupId}`, {
      customerFollowup: payload,
    });
  }

  delete(customerFollowupId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${customerFollowupId}`);
  }
}
```

- [ ] **Step 4: Verify it compiles**

Run: `pnpm build`
Expected: build succeeds with no TypeScript errors in the three new files.

- [ ] **Step 5: Commit**

```bash
git add src/app/routes/customers/customer-details/customer-followup-tab/customer-followup.model.ts \
        src/app/routes/customers/customer-details/customer-followup-tab/customer-followup.dto.ts \
        src/app/routes/customers/customer-details/customer-followup-tab/customer-followup.service.ts
git commit -m "feat(customer-followup): add model, dto, and service"
```

---

### Task 2: Permissions — mirror the backend access control

**Files:**
- Modify: `src/app/core/auth/organization-access-control.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `customerFollowup: ['get', 'create', 'update', 'delete']` statement, available to `AuthStore.hasPermission({ orgPermissions: { customerFollowup: [...] } })` calls in later tasks.

- [ ] **Step 1: Add the resource to the shared `statement` and all three roles**

In `organization-access-control.ts`, add `customerFollowup: ['get', 'create', 'update', 'delete'],` right after the existing `customerAnamnesis` line in `statement`, in `owner`, and in `admin`. Add `customerFollowup: ['get'],` after `customerAnamnesis` in `member` (matching `sale`'s member-is-read-only shape, not `customerAnamnesis`'s member-can-create shape):

```ts
// statement, owner, admin (identical line in all three):
  customerAnamnesis: ['get', 'create', 'update', 'finalize', 'delete'],
  customerFollowup: ['get', 'create', 'update', 'delete'],

// member:
  customerAnamnesis: ['get', 'create', 'update', 'finalize'],
  customerFollowup: ['get'],
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm build`
Expected: build succeeds — `better-auth`'s `createAccessControl`/`newRole` typing will fail to compile if any role object is missing the new key, so a passing build confirms all four role definitions were updated consistently.

- [ ] **Step 3: Commit**

```bash
git add src/app/core/auth/organization-access-control.ts
git commit -m "feat(auth): mirror backend customerFollowup access control"
```

---

### Task 3: Store — `CustomerFollowupTabStore`

**Files:**
- Create: `src/app/routes/customers/customer-details/customer-followup-tab/customer-followup-tab.store.ts`

**Interfaces:**
- Consumes: `CustomerFollowupService` (Task 1), `CustomerFollowupListItem` (Task 1), `CustomerDetailsStore.customerId(): Signal<string>` (existing, `../customer-details.store`), `extractApiErrorMessage` (existing, `../../../../model/api-error`).
- Produces: `CustomerFollowupTabStore` — `withEntities<CustomerFollowupListItem>()` (`.entities()`), state (`.total()`, `.page()`, `.loading()`, `.errorMessage()`), methods `setPage(page: number)`, `deleteRecord(record: CustomerFollowupListItem): Observable<...>`. Exported `PAGE_SIZE = 10`.

- [ ] **Step 1: Write the store**

```ts
// customer-followup-tab.store.ts
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { removeEntity, setAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { extractApiErrorMessage } from '../../../../model/api-error';
import { CustomerDetailsStore } from '../customer-details.store';
import { CustomerFollowupListItem } from './customer-followup.model';
import { CustomerFollowupService } from './customer-followup.service';

export const PAGE_SIZE = 10;
const DEFAULT_ERROR_MESSAGE = 'Não foi possível carregar os follow-ups do cliente.';
const DEFAULT_DELETE_ERROR_MESSAGE = 'Não foi possível excluir o follow-up.';

interface CustomerFollowupTabMeta {
  total: number;
  page: number;
  reloadTrigger: number;
  loading: boolean;
  errorMessage: string | null;
}

const initialMeta: CustomerFollowupTabMeta = {
  total: 0,
  page: 1,
  reloadTrigger: 0,
  loading: true,
  errorMessage: null,
};

interface LoadParams {
  customerId: string;
  page: number;
}

export const CustomerFollowupTabStore = signalStore(
  withEntities<CustomerFollowupListItem>(),
  withState(initialMeta),
  withMethods((store, customerFollowupService = inject(CustomerFollowupService)) => ({
    load: rxMethod<LoadParams>(
      pipe(
        tap(() => patchState(store, { loading: true, errorMessage: null })),
        switchMap(({ customerId, page }) =>
          customerFollowupService.list({ customerId, page, limit: PAGE_SIZE }).pipe(
            tapResponse({
              next: (result) => {
                patchState(store, setAllEntities(result.items));
                patchState(store, { total: result.meta.total, page });
              },
              error: (error: unknown) => {
                patchState(store, setAllEntities<CustomerFollowupListItem>([]));
                patchState(store, {
                  total: 0,
                  page,
                  errorMessage: extractApiErrorMessage(error, DEFAULT_ERROR_MESSAGE),
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    setPage(page: number) {
      patchState(store, { page });
    },

    deleteRecord(record: CustomerFollowupListItem) {
      patchState(store, { loading: true, errorMessage: null });

      return customerFollowupService.delete(record.id).pipe(
        tapResponse({
          next: () => {
            const isLastOnPage = store.entities().length === 1 && store.page() > 1;
            const isFullPage = store.entities().length === PAGE_SIZE;
            if (isLastOnPage) {
              patchState(store, (state) => ({ page: state.page - 1 }));
            } else if (isFullPage) {
              patchState(store, (state) => ({ reloadTrigger: state.reloadTrigger + 1 }));
            } else {
              patchState(store, removeEntity(record.id));
              patchState(store, (state) => ({ total: state.total - 1, loading: false }));
            }
          },
          error: (error: unknown) => {
            patchState(store, {
              loading: false,
              errorMessage: extractApiErrorMessage(error, DEFAULT_DELETE_ERROR_MESSAGE),
            });
          },
        }),
      );
    },
  })),
  withHooks({
    onInit(store) {
      const customerDetailsStore = inject(CustomerDetailsStore);
      store.load(
        computed(() => {
          store.reloadTrigger();
          return { customerId: customerDetailsStore.customerId(), page: store.page() };
        }),
      );
    },
  }),
);
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/routes/customers/customer-details/customer-followup-tab/customer-followup-tab.store.ts
git commit -m "feat(customer-followup): add tab store"
```

---

### Task 4: Ownership guard + detail resolver

**Files:**
- Create: `src/app/routes/customers/customer-details/customer-followup-tab/customer-followup-ownership.guard.ts`
- Create: `src/app/routes/customers/customer-details/customer-followup-tab/customer-followup-detail.resolver.ts`

**Interfaces:**
- Consumes: `CustomerFollowupService` (Task 1).
- Produces: `customerFollowupOwnershipGuard(): CanActivateFn`, `customerFollowupDetailResolver(): ResolveFn<CustomerFollowup>`. Both read route param `customerFollowupId`; the guard also reads `customerId` from `route.parent?.parent?.paramMap` (two levels up: `follow-up/:customerFollowupId` → `follow-up` → `:customerId`, same depth as `customer-anamnesis-detail.resolver.ts`).

- [ ] **Step 1: Write the ownership guard**

Because `GET /v1/customer-followup/:id` is a flat, non-nested endpoint, it doesn't verify the id belongs to the customer in the URL. This guard closes that gap at the routing layer (not in the resolver — a resolver's job is fetching data for the component, not making a navigation decision).

```ts
// customer-followup-ownership.guard.ts
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
```

- [ ] **Step 2: Write the detail resolver**

```ts
// customer-followup-detail.resolver.ts
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
```

- [ ] **Step 3: Verify it compiles**

Run: `pnpm build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/routes/customers/customer-details/customer-followup-tab/customer-followup-ownership.guard.ts \
        src/app/routes/customers/customer-details/customer-followup-tab/customer-followup-detail.resolver.ts
git commit -m "feat(customer-followup): add ownership guard and detail resolver"
```

---

### Task 5: List tab component

**Files:**
- Create: `src/app/routes/customers/customer-details/customer-followup-tab/customer-followup-tab.component.ts`
- Create: `src/app/routes/customers/customer-details/customer-followup-tab/customer-followup-tab.component.html`

**Interfaces:**
- Consumes: `CustomerFollowupTabStore`, `PAGE_SIZE` (Task 3), `CustomerFollowupListItem` (Task 1), `CustomerDetailsStore` (existing), `AuthStore.hasPermission` (existing), `DialogService.openConfirm` (existing).
- Produces: `CustomerFollowupTabComponent` (selector `app-customer-followup-tab`), routed at `follow-up` (wired in Task 8).

- [ ] **Step 1: Write the component class**

```ts
// customer-followup-tab.component.ts
import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCalendarPlus, LucideEye, LucidePencil, LucidePlus, LucideReceiptText, LucideTrash2 } from '@lucide/angular';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { ButtonComponent } from '../../../../components/button/button.component';
import { IconComponent } from '../../../../components/icon/icon.component';
import { IconButtonComponent } from '../../../../components/icon-button/icon-button.component';
import { LoadingOverlayDirective } from '../../../../components/loading-overlay/loading-overlay.directive';
import { PaginatorComponent } from '../../../../components/paginator/paginator.component';
import { ColDef } from '../../../../components/table/model/col-def';
import { TableComponent } from '../../../../components/table/table.component';
import { AuthStore } from '../../../../core/auth/auth.store';
import { DialogService } from '../../../../core/dialog/dialog.service';
import { CustomerDetailsStore } from '../customer-details.store';
import { CustomerFollowupListItem } from './customer-followup.model';
import { CustomerFollowupTabStore, PAGE_SIZE } from './customer-followup-tab.store';
import { viewChild, TemplateRef } from '@angular/core';
import { TableEvent } from '../../../../components/table/model/table-event';

@Component({
  selector: 'app-customer-followup-tab',
  imports: [
    AlertComponent,
    ButtonComponent,
    DatePipe,
    IconButtonComponent,
    IconComponent,
    LoadingOverlayDirective,
    PaginatorComponent,
    RouterLink,
    TableComponent,
  ],
  templateUrl: './customer-followup-tab.component.html',
  providers: [CustomerFollowupTabStore],
})
export class CustomerFollowupTabComponent {
  protected readonly detailsStore = inject(CustomerDetailsStore);
  protected readonly store = inject(CustomerFollowupTabStore);
  private readonly authStore = inject(AuthStore);
  private readonly dialogService = inject(DialogService);

  protected readonly LucidePlus = LucidePlus;
  protected readonly LucideEye = LucideEye;
  protected readonly LucidePencil = LucidePencil;
  protected readonly LucideTrash2 = LucideTrash2;
  protected readonly LucideCalendarPlus = LucideCalendarPlus;
  protected readonly LucideReceiptText = LucideReceiptText;
  protected readonly pageSize = PAGE_SIZE;

  protected readonly canCreate = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customerFollowup: ['create'] } }),
  );
  protected readonly canUpdate = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customerFollowup: ['update'] } }),
  );
  protected readonly canDelete = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customerFollowup: ['delete'] } }),
  );

  protected readonly trackBy = (record: CustomerFollowupListItem) => record.id;

  private readonly textTemplate = viewChild.required<TemplateRef<TableEvent>>('textTemplate');
  private readonly dateTemplate = viewChild.required<TemplateRef<TableEvent>>('dateTemplate');
  private readonly linkedTemplate = viewChild.required<TemplateRef<TableEvent>>('linkedTemplate');
  private readonly actionsTemplate = viewChild.required<TemplateRef<TableEvent>>('actionsTemplate');

  protected readonly columns = computed<ColDef<CustomerFollowupListItem>[]>(() => [
    { key: 'date', title: 'Data', type: 'template', template: this.dateTemplate },
    { key: 'text', title: 'Texto', type: 'template', template: this.textTemplate },
    { key: 'appointmentId', title: 'Vinculado', type: 'template', template: this.linkedTemplate },
    { key: 'id', title: 'Ações', type: 'template', template: this.actionsTemplate },
  ]);

  protected goToPage(page: number) {
    this.store.setPage(page);
  }

  protected openDeleteDialog(record: CustomerFollowupListItem) {
    this.dialogService.openConfirm({
      title: 'Excluir follow-up',
      message: 'Tem certeza que deseja excluir este follow-up? Essa ação não pode ser desfeita.',
      actions: [
        { label: 'Cancelar', btnOutline: true },
        {
          label: 'Excluir',
          danger: true,
          onClick: () => this.store.deleteRecord(record),
        },
      ],
    });
  }
}
```

- [ ] **Step 2: Write the template**

```html
<!-- customer-followup-tab.component.html -->
<div class="flex flex-wrap items-center justify-between gap-4">
  <h2 class="text-lg font-bold text-neutral-800 dark:text-neutral-100">Follow-ups</h2>
  @if (canCreate()) {
    <a btn btnPrimary routerLink="new">
      <app-icon size="sm" color="white" [icon]="LucidePlus" />
      Novo follow-up
    </a>
  }
</div>

@if (store.errorMessage(); as message) {
  <app-alert error>{{ message }}</app-alert>
}

<app-table
  [columns]="columns()"
  [data]="store.entities()"
  [trackBy]="trackBy"
  [loadingOverlay]="store.loading()"
/>

@if (!store.loading() && store.entities().length === 0) {
  <div
    class="rounded-xl border border-dashed border-neutral-300 p-8 text-center
      dark:border-neutral-700"
  >
    <p class="text-neutral-500 dark:text-neutral-400">Nenhum follow-up registrado.</p>
  </div>
}

<app-paginator
  mode="compact"
  [page]="store.page()"
  [pageSize]="pageSize"
  [length]="store.total()"
  [showPageSizeSelector]="false"
  [disabled]="store.loading()"
  (pageChange)="goToPage($event)"
/>

<ng-template #dateTemplate let-row="row">
  {{ row.date | date: 'dd/MM/yyyy' }}
</ng-template>

<ng-template #textTemplate let-row="row">
  <p class="line-clamp-2 max-w-md text-sm text-neutral-800 dark:text-neutral-100">
    {{ row.text }}
  </p>
</ng-template>

<ng-template #linkedTemplate let-row="row">
  <div class="flex items-center gap-1">
    @if (row.appointmentId) {
      <a
        iconBtn
        ariaLabel="Ver agendamento vinculado"
        size="sm"
        [routerLink]="['/appointments', row.appointmentId]"
        [icon]="LucideCalendarPlus"
      ></a>
    }
    @if (row.saleId) {
      <a
        iconBtn
        ariaLabel="Ver venda vinculada"
        size="sm"
        [routerLink]="['/sales', row.saleId]"
        [icon]="LucideReceiptText"
      ></a>
    }
  </div>
</ng-template>

<ng-template #actionsTemplate let-row="row">
  <div class="flex items-center gap-1">
    <a iconBtn ariaLabel="Ver follow-up" size="sm" [routerLink]="[row.id]" [icon]="LucideEye"></a>
    @if (canUpdate()) {
      <a
        iconBtn
        ariaLabel="Editar follow-up"
        size="sm"
        [routerLink]="[row.id, 'edit']"
        [icon]="LucidePencil"
      ></a>
    }
    @if (canDelete()) {
      <button
        iconBtn
        type="button"
        ariaLabel="Excluir follow-up"
        size="sm"
        [icon]="LucideTrash2"
        (click)="openDeleteDialog(row)"
      ></button>
    }
  </div>
</ng-template>
```

- [ ] **Step 3: Verify it compiles and renders**

Run: `pnpm build`
Expected: build succeeds. This component isn't reachable via routing yet (Task 8), so full manual click-through happens after Task 9 — for now, a clean build is the gate.

- [ ] **Step 4: Commit**

```bash
git add src/app/routes/customers/customer-details/customer-followup-tab/customer-followup-tab.component.ts \
        src/app/routes/customers/customer-details/customer-followup-tab/customer-followup-tab.component.html
git commit -m "feat(customer-followup): add list tab component"
```

---

### Task 6: Create/edit form page

**Files:**
- Create: `src/app/routes/customers/customer-details/customer-followup-tab/customer-followup-form-page/customer-followup-form-page.component.ts`
- Create: `src/app/routes/customers/customer-details/customer-followup-tab/customer-followup-form-page/customer-followup-form-page.component.html`

**Interfaces:**
- Consumes: `CustomerFollowup`, `CustomerFollowupItem` (Task 1 model), `CreateCustomerFollowupPayload`, `UpdateCustomerFollowupPayload`, `CustomerFollowupItemPayload` (Task 1 dto), `CustomerFollowupService` (Task 1), `CustomerDetailsStore` (existing), `AppointmentService.list({ customerId, limit })` returning `{ items: Appointment[] }` where `Appointment` has `id, startTime, catalogItemName` (existing, `../../../../appointments/appointment.service` + `.model`), `SaleService.list({ customerId, appointmentId?, limit })` returning `{ items: Sale[] }` where `Sale` has `id, createdAt, totalAmount, appointmentId?` (existing, `../../../../sales/sale.service` + `.model`), `CatalogItemService.list({ name, active, limit })` (existing, catalog-items feature), `TypeaheadComponent`/`TypeaheadItem` (existing, `../../../../components/typeahead/typeahead.component`).
- Produces: `CustomerFollowupFormPageComponent` (selector `app-customer-followup-form-page`), `customerFollowup = input<CustomerFollowup>()`. Routed at `new` and `:customerFollowupId/edit` (Task 8).

- [ ] **Step 1: Write the component class**

```ts
// customer-followup-form-page.component.ts
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  applyEach,
  disabled,
  form,
  FormField,
  FormRoot,
  maxLength,
  pattern,
  required,
  validate,
  ValidationError,
} from '@angular/forms/signals';
import dayjs from 'dayjs/esm';
import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { FormFieldComponent } from '../../../../../components/form-field/form-field.component';
import { HintComponent } from '../../../../../components/hint/hint.component';
import { InputDirective } from '../../../../../components/input/input.directive';
import { LabelComponent } from '../../../../../components/label/label.component';
import { SelectDirective } from '../../../../../components/select/select.directive';
import {
  TypeaheadComponent,
  TypeaheadItem,
} from '../../../../../components/typeahead/typeahead.component';
import { AlertComponent } from '../../../../../components/alert/alert.component';
import { IconButtonComponent } from '../../../../../components/icon-button/icon-button.component';
import { ToastService } from '../../../../../components/toast/toast.service';
import { extractApiErrorMessage, isApiErrorResponse } from '../../../../../model/api-error';
import { LucideTrash2 } from '@lucide/angular';
import { NgxMaskDirective } from 'ngx-mask';
import { AppointmentService } from '../../../../appointments/appointment.service';
import { CatalogItem } from '../../../../catalog-items/catalog-item.model';
import { CatalogItemService } from '../../../../catalog-items/catalog-item.service';
import { SaleService } from '../../../../sales/sale.service';
import { CustomerDetailsStore } from '../../customer-details.store';
import { CustomerFollowupItemPayload } from '../customer-followup.dto';
import { CustomerFollowup } from '../customer-followup.model';
import { CustomerFollowupService } from '../customer-followup.service';

const DEFAULT_ERROR_MESSAGE = 'Não foi possível salvar o follow-up. Tente novamente.';
const ENTITY_PICKER_LIMIT = 100;

interface CustomerFollowupItemFormValue {
  catalogItemId: string;
  catalogItemName: string;
  description: string;
  quantity: number | null;
  priceApplied: string;
}

interface CustomerFollowupFormModel {
  date: string;
  text: string;
  appointmentId: string;
  saleId: string;
  items: CustomerFollowupItemFormValue[];
}

type SaveResult =
  | { ok: true; customerFollowup: CustomerFollowup }
  | { ok: false; message: string; fieldErrors: Map<string, string[]> };

function emptyModel(): CustomerFollowupFormModel {
  return { date: dayjs().format('YYYY-MM-DD'), text: '', appointmentId: '', saleId: '', items: [] };
}

function emptyItem(): CustomerFollowupItemFormValue {
  return { catalogItemId: '', catalogItemName: '', description: '', quantity: 1, priceApplied: '' };
}

function modelFromRecord(record: CustomerFollowup): CustomerFollowupFormModel {
  return {
    date: dayjs(record.date).format('YYYY-MM-DD'),
    text: record.text,
    appointmentId: record.appointmentId ?? '',
    saleId: record.saleId ?? '',
    items: record.items.map((item) => ({
      catalogItemId: item.catalogItemId ?? '',
      catalogItemName: item.catalogItemName ?? '',
      description: item.description,
      quantity: item.quantity,
      priceApplied: item.priceApplied,
    })),
  };
}

@Component({
  selector: 'app-customer-followup-form-page',
  imports: [
    AlertComponent,
    ButtonComponent,
    FormField,
    FormFieldComponent,
    FormRoot,
    HintComponent,
    IconButtonComponent,
    InputDirective,
    LabelComponent,
    NgxMaskDirective,
    RouterLink,
    SelectDirective,
    TypeaheadComponent,
  ],
  templateUrl: './customer-followup-form-page.component.html',
})
export class CustomerFollowupFormPageComponent {
  readonly customerFollowup = input<CustomerFollowup>();

  private readonly customerDetailsStore = inject(CustomerDetailsStore);
  private readonly customerFollowupService = inject(CustomerFollowupService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly saleService = inject(SaleService);
  private readonly catalogItemService = inject(CatalogItemService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly LucideTrash2 = LucideTrash2;

  protected readonly customerId = computed(() => this.customerDetailsStore.customerId());
  protected readonly isEditing = computed(() => !!this.customerFollowup());

  protected readonly submitErrorMessage = signal<string | null>(null);
  protected readonly fieldErrorsByFieldId = signal<Map<string, string[]>>(new Map());

  private readonly appointmentIdChanged = signal(false);
  private readonly saleIdChanged = signal(false);

  private readonly catalogItemCache = new Map<string, CatalogItem>();

  protected readonly model = linkedSignal<CustomerFollowupFormModel>(() => {
    const record = this.customerFollowup();
    return record ? modelFromRecord(record) : emptyModel();
  });

  // The appointment/sale list APIs have no free-text search param (only
  // customerId/status/date-range), so these are bounded dropdowns scoped to
  // the customer, not a typeahead like the catalog-item picker below.
  protected readonly appointmentsResource = rxResource({
    params: () => ({ customerId: this.customerId() }),
    stream: ({ params }) =>
      this.appointmentService.list({ customerId: params.customerId, limit: ENTITY_PICKER_LIMIT }),
  });
  protected readonly appointmentOptions = computed(() =>
    (this.appointmentsResource.value()?.items ?? []).map((appointment) => ({
      id: appointment.id,
      label: `${dayjs(appointment.startTime).format('DD/MM/YYYY HH:mm')} — ${appointment.catalogItemName}`,
    })),
  );

  protected readonly salesResource = rxResource({
    params: () => ({
      customerId: this.customerId(),
      appointmentId: this.f.appointmentId().value() || undefined,
    }),
    stream: ({ params }) =>
      this.saleService.list({
        customerId: params.customerId,
        appointmentId: params.appointmentId,
        limit: ENTITY_PICKER_LIMIT,
      }),
  });
  protected readonly sales = computed(() => this.salesResource.value()?.items ?? []);
  protected readonly saleOptions = computed(() =>
    this.sales().map((sale) => ({
      id: sale.id,
      label: `${dayjs(sale.createdAt).format('DD/MM/YYYY')} — R$ ${Number(sale.totalAmount).toFixed(2).replace('.', ',')}`,
    })),
  );

  protected readonly f = form(
    this.model,
    (schema) => {
      required(schema.text, { message: 'Texto é obrigatório' });
      required(schema.date, { message: 'Data é obrigatória' });
      disabled(schema.appointmentId, { when: (ctx) => !!ctx.valueOf(schema.saleId) });

      applyEach(schema.items, (item) => {
        required(item.description, { message: 'Descrição é obrigatória' });
        maxLength(item.description, 2048, { message: 'Tamanho máximo de 2048 caracteres' });
        required(item.priceApplied, { message: 'Preço é obrigatório' });
        pattern(item.priceApplied, /^\d{1,8}(\.\d{1,2})?$/, { message: 'Preço inválido' });
        required(item.quantity, { message: 'Quantidade é obrigatória' });
        validate(item.quantity, ({ value }): ValidationError | null => {
          const quantity = value();
          return quantity !== null && Number.isInteger(quantity) && quantity > 0
            ? null
            : { kind: 'invalidQuantity', message: 'Quantidade deve ser maior que zero' };
        });
      });
    },
    {
      submission: {
        action: async (field) => {
          this.submitErrorMessage.set(null);
          this.fieldErrorsByFieldId.set(new Map());

          const value = field().value();
          const result = await this.save(value);

          if (!result.ok) {
            this.submitErrorMessage.set(result.message);
            this.fieldErrorsByFieldId.set(result.fieldErrors);
            return;
          }

          this.toastService.success(
            this.isEditing() ? 'Follow-up atualizado com sucesso.' : 'Follow-up criado com sucesso.',
          );
          await this.router.navigate([
            '/customers',
            this.customerId(),
            'follow-up',
            result.customerFollowup.id,
          ]);
        },
      },
    },
  );

  protected readonly catalogItemSearchFn = (query: string): Observable<TypeaheadItem[]> =>
    this.catalogItemService.list({ name: query, active: true, limit: 10 }).pipe(
      map((result) => {
        for (const item of result.items) {
          this.catalogItemCache.set(item.id, item);
        }
        return result.items.map((item) => ({ id: item.id, label: item.name }));
      }),
    );

  protected onCatalogItemSelected(index: number, item: TypeaheadItem | null) {
    const catalogItem = item ? this.catalogItemCache.get(item.id) : undefined;
    this.model.update((value) => ({
      ...value,
      items: value.items.map((row, i) =>
        i === index
          ? {
              ...row,
              catalogItemName: item?.label ?? '',
              priceApplied: row.priceApplied || (catalogItem?.defaultPrice ?? ''),
            }
          : row,
      ),
    }));
  }

  protected onAppointmentChange() {
    this.appointmentIdChanged.set(true);
  }

  protected onSaleChange() {
    this.saleIdChanged.set(true);
    const saleId = this.f.saleId().value();
    if (!saleId) {
      return;
    }
    const sale = this.sales().find((item) => item.id === saleId);
    this.appointmentIdChanged.set(true);
    this.model.update((value) => ({ ...value, appointmentId: sale?.appointmentId ?? '' }));
  }

  protected addItem() {
    this.model.update((value) => ({ ...value, items: [...value.items, emptyItem()] }));
  }

  protected removeItem(index: number) {
    this.model.update((value) => ({ ...value, items: value.items.filter((_, i) => i !== index) }));
  }

  private buildItemsPayload(items: CustomerFollowupItemFormValue[]): CustomerFollowupItemPayload[] {
    return items.map((item) => ({
      description: item.description.trim(),
      catalogItemId: item.catalogItemId || undefined,
      quantity: item.quantity ?? 1,
      priceApplied: item.priceApplied.trim(),
    }));
  }

  private save(value: CustomerFollowupFormModel): Promise<SaveResult> {
    const isoDate = dayjs(value.date).toISOString();
    const items = this.buildItemsPayload(value.items);
    const record = this.customerFollowup();
    const customerId = this.customerId();

    const request$: Observable<SaveResult> = record
      ? this.customerFollowupService
          .update(record.id, {
            text: value.text,
            date: isoDate,
            appointmentId: this.appointmentIdChanged() ? value.appointmentId || null : undefined,
            saleId: this.saleIdChanged() ? value.saleId || null : undefined,
            items,
          })
          .pipe(
            map(
              (): SaveResult => ({
                ok: true,
                customerFollowup: { ...record, text: value.text, date: isoDate },
              }),
            ),
          )
      : this.customerFollowupService
          .create({
            customerId,
            text: value.text,
            date: isoDate,
            appointmentId: value.appointmentId || undefined,
            saleId: value.saleId || undefined,
            items,
          })
          .pipe(map((created): SaveResult => ({ ok: true, customerFollowup: created })));

    return firstValueFrom(request$.pipe(catchError((error) => of(this.toSaveError(error)))));
  }

  private toSaveError(error: unknown): SaveResult {
    const fieldErrors = new Map<string, string[]>();
    const body =
      error && typeof error === 'object' && 'error' in error
        ? (error as { error: unknown }).error
        : undefined;

    if (isApiErrorResponse(body)) {
      for (const detail of body.error.details ?? []) {
        fieldErrors.set(detail.field, [...(fieldErrors.get(detail.field) ?? []), detail.issue]);
      }
    }

    return {
      ok: false,
      message: extractApiErrorMessage(error, DEFAULT_ERROR_MESSAGE),
      fieldErrors,
    };
  }
}
```

- [ ] **Step 2: Write the template**

```html
<!-- customer-followup-form-page.component.html -->
<div>
  <a
    class="text-primary-600 dark:text-primary-300 text-sm hover:underline"
    [routerLink]="['/customers', customerId(), 'follow-up']"
  >
    ← Voltar para follow-ups
  </a>
</div>

<div class="flex flex-col gap-6">
  <h1 class="text-primary-800 dark:text-primary-300 text-2xl font-bold">
    {{ isEditing() ? 'Editar follow-up' : 'Novo follow-up' }}
  </h1>

  <form class="flex flex-col gap-8" [formRoot]="f">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <app-form-field>
        <label appLabel for="customer-followup-date">Data</label>
        <input appInput type="date" [formField]="f.date" id="customer-followup-date" />
      </app-form-field>
    </div>

    <app-form-field>
      <label appLabel for="customer-followup-text">Texto</label>
      <textarea appInput rows="4" [formField]="f.text" id="customer-followup-text"></textarea>
    </app-form-field>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <app-form-field>
        <label appLabel for="customer-followup-appointment">Agendamento vinculado</label>
        <select
          appSelect
          [formField]="f.appointmentId"
          (change)="onAppointmentChange()"
          id="customer-followup-appointment"
        >
          <option value="">Nenhum</option>
          @for (option of appointmentOptions(); track option.id) {
            <option [value]="option.id">{{ option.label }}</option>
          }
        </select>
        @if (f.appointmentId().disabled()) {
          <app-hint>Definido automaticamente pela venda selecionada.</app-hint>
        }
      </app-form-field>

      <app-form-field>
        <label appLabel for="customer-followup-sale">Venda vinculada</label>
        <select
          appSelect
          [formField]="f.saleId"
          (change)="onSaleChange()"
          id="customer-followup-sale"
        >
          <option value="">Nenhuma</option>
          @for (option of saleOptions(); track option.id) {
            <option [value]="option.id">{{ option.label }}</option>
          }
        </select>
      </app-form-field>
    </div>

    <div>
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Itens</h2>
        <button btn btnOutline type="button" (click)="addItem()">Adicionar item</button>
      </div>

      <div class="flex flex-col gap-3">
        @for (item of f.items; track $index; let i = $index) {
          <div class="grid grid-cols-1 items-start gap-2 sm:grid-cols-[2fr_1.5fr_1fr_1fr_auto]">
            <app-form-field>
              <label appLabel [for]="'customer-followup-item-description-' + i">Descrição</label>
              <input
                appInput
                type="text"
                [formField]="item.description"
                [id]="'customer-followup-item-description-' + i"
              />
            </app-form-field>

            <app-typeahead
              label="Item do catálogo (opcional)"
              placeholder="Buscar produto ou serviço"
              emptyMessage="Nenhum item encontrado."
              [formField]="item.catalogItemId"
              [searchFn]="catalogItemSearchFn"
              (itemSelected)="onCatalogItemSelected(i, $event)"
            />

            <app-form-field>
              <label appLabel [for]="'customer-followup-item-quantity-' + i">Quantidade</label>
              <input
                appInput
                type="number"
                inputmode="numeric"
                [formField]="item.quantity"
                [id]="'customer-followup-item-quantity-' + i"
              />
            </app-form-field>

            <app-form-field>
              <label appLabel [for]="'customer-followup-item-price-' + i">Preço</label>
              <input
                appInput
                type="text"
                inputmode="decimal"
                mask="separator.2"
                prefix="R$ "
                [formField]="item.priceApplied"
                [id]="'customer-followup-item-price-' + i"
              />
            </app-form-field>

            <button
              class="self-center"
              iconBtn
              type="button"
              ariaLabel="Remover item"
              size="sm"
              [icon]="LucideTrash2"
              (click)="removeItem(i)"
            ></button>
          </div>
        }

        @if (!f.items().value().length) {
          <p class="text-sm text-neutral-500 dark:text-neutral-400">Nenhum item adicionado.</p>
        }
      </div>
    </div>

    @if (submitErrorMessage(); as message) {
      <app-alert error>{{ message }}</app-alert>
    }

    <div class="flex justify-end gap-3">
      <a btn btnOutline [routerLink]="['/customers', customerId(), 'follow-up']">Cancelar</a>
      <button
        btn
        btnPrimary
        type="submit"
        [disabled]="f().invalid() || f().submitting() || (isEditing() && !f().dirty())"
        [btnLoading]="f().submitting()"
      >
        {{ isEditing() ? 'Salvar alterações' : 'Criar follow-up' }}
      </button>
    </div>
  </form>
</div>
```

- [ ] **Step 3: Verify it compiles**

Run: `pnpm build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/routes/customers/customer-details/customer-followup-tab/customer-followup-form-page/
git commit -m "feat(customer-followup): add create/edit form page"
```

---

### Task 7: Detail page

**Files:**
- Create: `src/app/routes/customers/customer-details/customer-followup-tab/customer-followup-detail-page/customer-followup-detail-page.component.ts`
- Create: `src/app/routes/customers/customer-details/customer-followup-tab/customer-followup-detail-page/customer-followup-detail-page.component.html`

**Interfaces:**
- Consumes: `CustomerFollowup` (Task 1 model), `CustomerFollowupService` (Task 1), `CustomerDetailsStore`/`AuthStore`/`DialogService` (existing).
- Produces: `CustomerFollowupDetailPageComponent` (selector `app-customer-followup-detail-page`), `customerFollowup = input.required<CustomerFollowup>()`. Routed at `:customerFollowupId` (Task 8).

- [ ] **Step 1: Write the component class**

```ts
// customer-followup-detail-page.component.ts
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { catchError, firstValueFrom, of } from 'rxjs';
import { LucidePencil, LucideTrash2 } from '@lucide/angular';
import Big from 'big.js';
import { AlertComponent } from '../../../../../components/alert/alert.component';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { IconButtonComponent } from '../../../../../components/icon-button/icon-button.component';
import { AuthStore } from '../../../../../core/auth/auth.store';
import { DialogService } from '../../../../../core/dialog/dialog.service';
import { extractApiErrorMessage } from '../../../../../model/api-error';
import { safeAsync } from '../../../../../shared/safe';
import { CustomerDetailsStore } from '../../customer-details.store';
import { CustomerFollowup } from '../customer-followup.model';
import { CustomerFollowupService } from '../customer-followup.service';

const DEFAULT_DELETE_ERROR_MESSAGE = 'Não foi possível excluir o follow-up.';

@Component({
  selector: 'app-customer-followup-detail-page',
  imports: [
    AlertComponent,
    ButtonComponent,
    CurrencyPipe,
    DatePipe,
    IconButtonComponent,
    RouterLink,
  ],
  templateUrl: './customer-followup-detail-page.component.html',
})
export class CustomerFollowupDetailPageComponent {
  readonly customerFollowup = input.required<CustomerFollowup>();

  private readonly customerDetailsStore = inject(CustomerDetailsStore);
  private readonly customerFollowupService = inject(CustomerFollowupService);
  private readonly authStore = inject(AuthStore);
  private readonly dialogService = inject(DialogService);
  private readonly router = inject(Router);

  protected readonly LucidePencil = LucidePencil;
  protected readonly LucideTrash2 = LucideTrash2;

  protected readonly customerId = computed(() => this.customerDetailsStore.customerId());
  protected readonly record = linkedSignal(() => this.customerFollowup());

  protected readonly deleteErrorMessage = signal<string | null>(null);

  protected readonly canUpdate = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customerFollowup: ['update'] } }),
  );
  protected readonly canDelete = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customerFollowup: ['delete'] } }),
  );

  protected readonly itemsTotal = computed(() => {
    const total = this.record().items.reduce(
      (sum, item) => sum.plus(new Big(item.priceApplied).times(item.quantity)),
      new Big(0),
    );
    return total.toFixed(2);
  });

  protected openDeleteDialog() {
    const customerId = this.customerId();
    const record = this.record();
    this.dialogService.openConfirm({
      title: 'Excluir follow-up',
      message: 'Tem certeza que deseja excluir este follow-up? Essa ação não pode ser desfeita.',
      actions: [
        { label: 'Cancelar', btnOutline: true },
        {
          label: 'Excluir',
          danger: true,
          onClick: async () => {
            this.deleteErrorMessage.set(null);
            const [error] = await safeAsync(() =>
              firstValueFrom(this.customerFollowupService.delete(record.id)),
            );
            if (error) {
              this.deleteErrorMessage.set(
                extractApiErrorMessage(error, DEFAULT_DELETE_ERROR_MESSAGE),
              );
              return;
            }
            await this.router.navigate(['/customers', customerId, 'follow-up']);
          },
        },
      ],
    });
  }
}
```

- [ ] **Step 2: Write the template**

```html
<!-- customer-followup-detail-page.component.html -->
<div>
  <a
    class="text-primary-600 dark:text-primary-300 text-sm hover:underline"
    [routerLink]="['/customers', customerId(), 'follow-up']"
  >
    ← Voltar para follow-ups
  </a>
</div>

@let followup = record();

<div class="flex flex-col gap-6">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <h1 class="text-primary-800 dark:text-primary-300 text-2xl font-bold">
      Follow-up de {{ followup.date | date: 'dd/MM/yyyy' }}
    </h1>
    <div class="flex items-center gap-2">
      @if (canUpdate()) {
        <a
          iconBtn
          ariaLabel="Editar follow-up"
          [routerLink]="['edit']"
          [icon]="LucidePencil"
        ></a>
      }
      @if (canDelete()) {
        <button
          iconBtn
          type="button"
          ariaLabel="Excluir follow-up"
          [icon]="LucideTrash2"
          (click)="openDeleteDialog()"
        ></button>
      }
    </div>
  </div>

  @if (deleteErrorMessage(); as message) {
    <app-alert error>{{ message }}</app-alert>
  }

  <p class="whitespace-pre-wrap text-sm text-neutral-800 dark:text-neutral-100">
    {{ followup.text }}
  </p>

  <div class="flex flex-wrap gap-3">
    @if (followup.appointmentId) {
      <a
        btn
        btnOutline
        [routerLink]="['/appointments', followup.appointmentId]"
      >
        Ver agendamento vinculado
      </a>
    }
    @if (followup.saleId) {
      <a btn btnOutline [routerLink]="['/sales', followup.saleId]">Ver venda vinculada</a>
    }
  </div>

  @if (followup.items.length) {
    <div>
      <h2 class="mb-3 text-lg font-semibold text-neutral-800 dark:text-neutral-100">Itens</h2>
      <ul class="divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-700 dark:border-neutral-700">
        @for (item of followup.items; track item.id) {
          <li class="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <span class="text-neutral-800 dark:text-neutral-100">
              {{ item.description }} @if (item.catalogItemName) {
                <span class="text-neutral-500 dark:text-neutral-400">({{ item.catalogItemName }})</span>
              }
              × {{ item.quantity }}
            </span>
            <span class="font-semibold text-neutral-800 dark:text-neutral-100">
              {{ item.priceApplied | currency: 'BRL' }}
            </span>
          </li>
        }
      </ul>
      <p class="mt-3 text-right text-sm font-semibold text-neutral-800 dark:text-neutral-100">
        Total: {{ itemsTotal() | currency: 'BRL' }}
      </p>
    </div>
  }
</div>
```

- [ ] **Step 3: Verify it compiles**

Run: `pnpm build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/routes/customers/customer-details/customer-followup-tab/customer-followup-detail-page/
git commit -m "feat(customer-followup): add detail page"
```

---

### Task 8: Route wiring

**Files:**
- Modify: `src/app/routes/customers/customer.routes.ts`

**Interfaces:**
- Consumes: `CustomerFollowupTabComponent` (Task 5), `CustomerFollowupFormPageComponent` (Task 6), `CustomerFollowupDetailPageComponent` (Task 7), `customerFollowupDetailResolver`, `customerFollowupOwnershipGuard` (Task 4), `hasPermissionGuard` (existing).

- [ ] **Step 1: Add static imports and the route block**

Add near the top of `customer.routes.ts`, alongside the existing `customerAnamnesisDetailResolver` import:

```ts
import { customerFollowupDetailResolver } from './customer-details/customer-followup-tab/customer-followup-detail.resolver';
import { customerFollowupOwnershipGuard } from './customer-details/customer-followup-tab/customer-followup-ownership.guard';
```

Add a new sibling block to the `anamnesis` children block, inside the `:customerId` route's `children` array:

```ts
{
  path: 'follow-up',
  children: [
    {
      path: '',
      loadComponent: () =>
        import('./customer-details/customer-followup-tab/customer-followup-tab.component').then(
          (m) => m.CustomerFollowupTabComponent,
        ),
      canActivate: [hasPermissionGuard({ orgPermissions: { customerFollowup: ['get'] } })],
    },
    {
      path: 'new',
      loadComponent: () =>
        import(
          './customer-details/customer-followup-tab/customer-followup-form-page/customer-followup-form-page.component'
        ).then((m) => m.CustomerFollowupFormPageComponent),
      canActivate: [hasPermissionGuard({ orgPermissions: { customerFollowup: ['create'] } })],
    },
    {
      path: ':customerFollowupId',
      loadComponent: () =>
        import(
          './customer-details/customer-followup-tab/customer-followup-detail-page/customer-followup-detail-page.component'
        ).then((m) => m.CustomerFollowupDetailPageComponent),
      canActivate: [
        hasPermissionGuard({ orgPermissions: { customerFollowup: ['get'] } }),
        customerFollowupOwnershipGuard(),
      ],
      resolve: { customerFollowup: customerFollowupDetailResolver() },
    },
    {
      path: ':customerFollowupId/edit',
      loadComponent: () =>
        import(
          './customer-details/customer-followup-tab/customer-followup-form-page/customer-followup-form-page.component'
        ).then((m) => m.CustomerFollowupFormPageComponent),
      canActivate: [
        hasPermissionGuard({ orgPermissions: { customerFollowup: ['update'] } }),
        customerFollowupOwnershipGuard(),
      ],
      resolve: { customerFollowup: customerFollowupDetailResolver() },
    },
  ],
},
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/routes/customers/customer.routes.ts
git commit -m "feat(customer-followup): wire up follow-up routes"
```

---

### Task 9: Tab entry + manual verification

**Files:**
- Modify: `src/app/routes/customers/customer-details/customer-details.component.ts`

**Interfaces:**
- Consumes: `AuthStore.hasPermission` (existing).

- [ ] **Step 1: Add the permission signal and tab entry**

In `customer-details.component.ts`, add alongside `canViewAnamnesis`:

```ts
protected readonly canViewCustomerFollowup = computed(() =>
  this.authStore.hasPermission({ orgPermissions: { customerFollowup: ['get'] } }),
);
```

And add to the `tabs` computed, after the anamnesis entry:

```ts
...(this.canViewCustomerFollowup() ? [{ label: 'Follow-up', link: 'follow-up' }] : []),
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm build`
Expected: build succeeds.

- [ ] **Step 3: Manual verification through the dev server**

Start the dev server (`mcp__angular-cli__devserver_start` or `pnpm start`) and, in a browser, on an existing customer's page:

1. Open the "Follow-up" tab — empty state renders, "Novo follow-up" button visible for an owner/admin session.
2. Create a follow-up with just date + text, no items, no links — verify it appears in the list, detail page shows it correctly.
3. Create a follow-up, pick an appointment, verify the sale dropdown narrows to sales linked to that appointment (or stays empty if none).
4. Create a follow-up, pick a sale directly (skip the appointment) — verify the appointment field auto-fills and becomes disabled, with the hint text showing.
5. Add two items (one with a catalog item picked, one free-text) with different prices/quantities — verify the detail page's item total is correct.
6. Edit an existing follow-up: change only the text, verify `items`/links are unaffected; then edit again and replace the items — verify the old items are gone.
7. Delete a follow-up from both the list row and the detail page — verify list count/pagination updates correctly.
8. Check both light and dark mode render correctly (per `docs/CONVENTIONS.md`'s dark-mode requirement).
9. If a `member`-role session is available, verify create/edit/delete controls are hidden and only viewing works.
10. Hand-edit the URL to a `:customerFollowupId` that belongs to a different customer than the one in the URL's `:customerId` — verify the ownership guard redirects back to the follow-up list instead of rendering the mismatched record.

Expected: all ten checks pass. Note any failures instead of proceeding.

- [ ] **Step 4: Commit**

```bash
git add src/app/routes/customers/customer-details/customer-details.component.ts
git commit -m "feat(customer-followup): add tab entry to customer details"
```

---

### Task 10: TODO bookkeeping (both repos)

**Files:**
- Modify: `TODO.md` (this repo, `estetica-prototype-fe`)
- Modify: `TODO_DONE.md` (this repo)
- Modify: `/Users/stlmpp/projects/estetica-prototype-api/TODO.md` (sibling repo)

**Interfaces:** none (documentation only).

- [ ] **Step 1: Move FE-7 to `TODO_DONE.md` in this repo**

Remove the FE-7 entry from `TODO.md` and append it to `TODO_DONE.md`, in the same format as the neighboring done items (checked box, done-date prefix), e.g.:

```md
- [x] **FE-7** (2026-08-21) Customer follow-up UI built: `customer-followup-tab`
      (list, create/edit form, detail view) alongside the existing
      `customer-details` tabs, mirroring `customer-anamnesis-tab`'s full-CRUD
      structure. See
      `docs/superpowers/specs/2026-08-21-customer-followup-frontend-design.md`.
```

- [ ] **Step 2: Add FE-26 to this repo's `TODO.md`**

Append after the current highest entry (`FE-25`):

```md
- [ ] **FE-26** The customer-followup list (`customer-followup-tab.component`)
      doesn't show an item count/total per row — the shipped
      `GET /v1/customer-followup` list endpoint returns lightweight rows with
      no `items` field, only the detail endpoint includes items. Revisit
      whether it's worth adding a cheap items-count/total to the list row's
      backend response if this becomes a real usability gap in practice
      (paired with `BE-32` in `estetica-prototype-api`'s `TODO.md`; low
      priority).
```

- [ ] **Step 3: Add BE-32 to the sibling backend repo's `TODO.md`**

In `/Users/stlmpp/projects/estetica-prototype-api/TODO.md`, append after the current highest entry:

```md
- [ ] **BE-32** `GET /v1/customer-followup`'s list rows have no items/total —
      only the detail endpoint (`GET /v1/customer-followup/:id`) returns
      `items`. The frontend's follow-up list can't show an item count/total
      per row without an N+1 fetch (see `FE-26` in
      `estetica-prototype-fe`'s `TODO.md`). Revisit whether a cheap
      items-count/total is worth adding to the list row if this becomes a
      real usability gap in practice; low priority.
```

- [ ] **Step 4: Commit both repos separately**

```bash
git -C /Users/stlmpp/projects/estetica-prototype-fe add TODO.md TODO_DONE.md
git -C /Users/stlmpp/projects/estetica-prototype-fe commit -m "docs: close FE-7, add FE-26 (list item-total revisit)"

git -C /Users/stlmpp/projects/estetica-prototype-api add TODO.md
git -C /Users/stlmpp/projects/estetica-prototype-api commit -m "docs: add BE-32 (paired with FE-26, list item-total revisit)"
```

---

### Task 11: Format and lint (final step)

**Files:** none new — repo-wide.

- [ ] **Step 1: Format**

Run: `pnpm format`
Expected: Prettier reformats any files that drifted from style during the tasks above; review the diff before committing if anything unexpected changed.

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: no errors. Fix anything flagged (most likely unused-import warnings from the notes left in Tasks 5 and 6 about `IconComponent`/`ApiErrorDetail`).

- [ ] **Step 3: Full build**

Run: `pnpm build`
Expected: clean build, confirming formatting/lint fixes didn't break anything.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(customer-followup): format and lint"
```

---

## After Task 11

Stop. Per the Global Constraints above, let the user review the code themselves before invoking `superpowers:requesting-code-review`. Do not run that skill until they've confirmed.
