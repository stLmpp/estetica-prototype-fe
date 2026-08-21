# CustomerFollowup frontend — design

Closes **FE-7** (this repo's `TODO.md`). Frontend half of the
`CustomerFollowup` feature; the backend (BE-7, `estetica-prototype-api`)
is implemented and merged (PR #2, `worktree-customer-followup-backend`).

Read alongside:
- `estetica-prototype-api`'s `docs/superpowers/specs/2026-08-21-customer-followup-design.md`
  (backend design — its "Frontend integration" section sketches an
  approach written *before* the backend was built; this doc supersedes
  that sketch where they disagree, see "Deviations" below).
- `estetica-prototype-api`'s `docs/features/customer-followup/FUNCTIONAL.md`
  (shipped business rules — authoritative for backend behavior).

## What CustomerFollowup is

A dated note about a customer, optionally linked to the appointment
and/or sale it follows up on, with optional priced items underneath.
No status/lifecycle, no reminders (BE-30/FE-30, later). Editing replaces
items wholesale.

## Verified API contract

All routes flat under `/v1/customer-followup` (not nested under
`/customer/:id/...`).

- `POST /v1/customer-followup` → 201. Body:
  `{ customerFollowup: { customerId, text, date?, appointmentId?, saleId?, items? } }`.
  Item: `{ description (1-2048 chars), catalogItemId?, quantity? (positive int, default 1), priceApplied (required, /^\d{1,8}(\.\d{1,2})?$/) }`.
  `priceApplied` is **always required on input**, even with
  `catalogItemId` set — no auto-pricing lookup (unlike sale items).
- `GET /v1/customer-followup?customerId=<required>&page=&limit=` → 200,
  `{ data: { items: FollowupListRow[] }, meta: { total, page, limit } }`.
  **List rows have no `items` field** — lighter than the full record:
  `{ id, customerId, text, date, appointmentId?, saleId? }`.
- `GET /v1/customer-followup/:id` → 200,
  `{ data: { customerFollowup: FollowupRecord } }`. Full record incl.
  `items: FollowupItem[]` (`FollowupItem` includes `catalogItemName?`).
- `PATCH /v1/customer-followup/:id` → 204. Body:
  `{ customerFollowup: { text?, date?, appointmentId?: string|null, saleId?: string|null, items? } }`
  — at least one field required (empty object → 400).
  `appointmentId`/`saleId`: omit = unchanged, `null` = clear, string =
  set. Providing `items` at all replaces the whole set.
- `DELETE /v1/customer-followup/:id` → 204 (soft delete; subsequent GET
  → 404).

### Business rules the UI must respect

- `appointmentId`/`saleId` optional and independent — neither, either,
  or both.
- If both set, the sale's own `appointmentId` must equal the given
  `appointmentId` (server: 422 `CUSTOMER_FOLLOWUP_SALE_APPOINTMENT_MISMATCH`).
  This design eliminates the mismatch case structurally (see "Entity
  pickers" below) rather than catching it at submit.
- A picked appointment/sale must belong to the customer the follow-up is
  for (server: 422 `CUSTOMER_FOLLOWUP_APPOINTMENT_MISMATCH` /
  `CUSTOMER_FOLLOWUP_SALE_MISMATCH`) — satisfied by construction since
  both pickers are always scoped by `customerId`.
- Permissions: `member` role — `get` only. `owner`/`admin` — full CRUD.

## Precedents followed

- **`customer-anamnesis-tab`** — full-CRUD tab structure: table list with
  role-gated inline actions, `store.ts`/`.service.ts`/`.model.ts`/`.dto.ts`
  split, `new`/`:id`/`:id/edit` nested routes, shared form-page component,
  detail-page component, `NgRx SignalStore` with `withEntities`.
- **`sale-form`** — items sub-form shape (`applyEach`, add/remove rows,
  `app-typeahead` for catalog-item search), cross-field total via `Big.js`.

## Data layer

`src/app/routes/customers/customer-details/customer-followup-tab/`:

- **`customer-followup.model.ts`** — `CustomerFollowup` (full record,
  `items: CustomerFollowupItem[]`), `CustomerFollowupListItem` (list row,
  no `items`), `CustomerFollowupItem`.
- **`customer-followup.dto.ts`** — `CreateCustomerFollowupPayload`,
  `UpdateCustomerFollowupPayload` (`appointmentId`/`saleId` typed
  `string | null | undefined` to express the three states), item payload
  shape, `ListCustomerFollowupFilter`/`Result`.
- **`customer-followup.service.ts`** — flat base URL
  `${environment.api}/v1/customer-followup`; `list(filter)` (filter incl.
  required `customerId`), `getById(id)`, `create(payload)`,
  `update(id, payload)`, `delete(id)`.
- **`customer-followup-tab.store.ts`** — `NgRx SignalStore`,
  `withEntities<CustomerFollowupListItem>()`, paginated `load` keyed on
  `{ customerId, page }`, same delete-with-repage logic as
  `CustomerAnamnesisTabStore` (shift back a page if deleting the last
  row on a non-first page, trigger reload if deleting from a full page).

## Routing

New `follow-up` child route under `customer.routes.ts` (single word,
matching `info`/`phones`/`sales`/`anamnesis`), structured like
`anamnesis`:

```
follow-up                    list (customerFollowup: ['get'])
follow-up/new                create form (customerFollowup: ['create'])
follow-up/:customerFollowupId          detail (customerFollowup: ['get'] + ownership guard)
follow-up/:customerFollowupId/edit     edit form (customerFollowup: ['update'] + ownership guard)
```

### Ownership guard

Because the API is flat, `GET /v1/customer-followup/:id` doesn't verify
the id belongs to the customer in the URL — unlike `customer-anamnesis`,
whose nested URL makes this a non-issue. A hand-edited URL could
otherwise render one customer's follow-up under a different customer's
page.

`customer-followup-ownership.guard.ts` — a `CanActivateFn` factory
(`customerFollowupOwnershipGuard()`, same shape as `hasPermissionGuard`
in `auth.guards.ts`), applied on both `:customerFollowupId` and
`:customerFollowupId/edit`:

```ts
export function customerFollowupOwnershipGuard(): CanActivateFn {
  return (route) => {
    const router = inject(Router);
    const service = inject(CustomerFollowupService);
    const customerId = route.parent?.parent?.paramMap.get('customerId')!;
    const customerFollowupId = route.paramMap.get('customerFollowupId')!;

    return service.getById(customerFollowupId).pipe(
      map((record) =>
        record.customerId === customerId
          ? true
          : router.createUrlTree(['/customers', customerId, 'follow-up']),
      ),
      catchError(() =>
        of(router.createUrlTree(['/customers', customerId, 'follow-up'])),
      ),
    );
  };
}
```

Returns the `Observable` directly (router-owned subscription, matches
`docs/CONVENTIONS.md`'s guard/resolver rule). The resolver
(`customer-followup-detail.resolver.ts`, matching
`customer-anamnesis-detail.resolver.ts`) keeps its single job — fetching
data for the component — so this is a deliberate second `GET` on these
two routes; acceptable given how infrequently this page is hit. The
backend remains the actual authorization boundary; this guard only stops
the UI from displaying mismatched data.

## Permissions

Add to `core/auth/organization-access-control.ts` (mirroring the
backend's already-merged `organization-access-control.ts` by hand, per
existing convention):

```ts
customerFollowup: ['get', 'create', 'update', 'delete'],
```

`owner`/`admin` roles get the full set; `member` gets `['get']` only —
same shape as `sale` (member: `['get']`), not `customerAnamnesis`
(member: full CRUD minus delete).

Add a `follow-up` tab entry to `customer-details.component.ts`'s `tabs`
computed, gated by a `canViewCustomerFollowup` computed signal (same
pattern as `canViewAppointments`/`canViewSales`/`canViewAnamnesis`).
Create/edit/delete actions in the list and detail pages are gated by
`canCreate`/`canUpdate`/`canDelete` computed signals off
`AuthStore.hasPermission`, same as `customer-anamnesis-tab`.

## List tab UI

`customer-followup-tab.component` — `app-table` (not the simpler
read-only `sales-tab` list — this is full CRUD like anamnesis), columns:

| Date | Text preview | Linked | Actions |
|---|---|---|---|

- **Date** — `date | date:'dd/MM/yyyy'`.
- **Text preview** — CSS line-clamp (not JS string truncation) so long
  notes don't blow out row height.
- **Linked** — icon badges, shown only when set: `LucideCalendarPlus`
  (already used for appointments elsewhere in the app) linking to
  `/appointments/:id` if `appointmentId` present; `LucideReceiptText`
  (already used for sales) linking to `/sales/:id` if `saleId` present.
  Neither shown → standalone note, no badges.
- **Actions** — view (always, `LucideEye`); edit (`LucidePencil`,
  `canUpdate`) and delete (`LucideTrash2`, `canDelete`), same
  confirm-dialog pattern as anamnesis's `openDeleteDialog`.

"Novo follow-up" primary action button (top of tab, `canCreate`-gated),
empty state ("Nenhum follow-up registrado."), `app-paginator` in
`'compact'` mode, `PAGE_SIZE = 10` — all matching
`customer-anamnesis-tab.component.html` structure directly.

## Create/edit form (`customer-followup-form-page`)

Shared component for create and edit, `customerFollowup = input<CustomerFollowup>()`
optional input distinguishing the two (same shape as
`CustomerAnamnesisFormPageComponent`).

### Fields

- **Date** — `type="date"`, defaults to today on create
  (`dayjs().format('YYYY-MM-DD')`), converted to ISO on submit.
- **Text** — `<textarea>` via `app-form-field`, `required()`, no max
  length (backend only enforces `min(1)`).
- **Appointment / Sale pickers** — plain `<select appSelect>` dropdowns,
  **not** `app-typeahead`. Unlike customer/employee/catalog-item lookups,
  the appointment and sale list endpoints have no free-text search
  parameter (only `customerId`/`employeeId`/`status`/date-range/etc.) —
  a search box doesn't fit a list endpoint you can't search. A
  `customerId`-scoped dropdown does, mirroring
  `customer-anamnesis-form-page`'s `activeForms` `<select>`.

  **Sale drives appointment, not the reverse** — this makes the
  cross-field mismatch structurally impossible instead of just being
  caught at submit:
  - **No sale selected**: appointment `<select>` is fully interactive,
    options from `appointmentService.list({ customerId, limit: 100 })`.
    Sale `<select>`'s option set is reactive on the chosen
    appointment — `saleService.list({ customerId, appointmentId: appointmentId || undefined, limit: 100 })`
    — so picking an appointment first narrows the sale list to only
    sales already linked to it.
  - **Sale selected**: `appointmentId` is auto-set from that sale's own
    `appointmentId` (already present on the `Sale` list-item shape — no
    extra fetch needed). The appointment `<select>` becomes disabled,
    showing that single derived value (or empty + disabled with a hint
    if the sale has no linked appointment). Hint text: "Definido
    automaticamente pela venda selecionada."
  - Clearing the sale re-enables the appointment `<select>`, current
    value left in place (still valid, now editable again).
  - Both option resources scoped by `customerId`; both fields optional
    (no `required()` on either).
- **Items sub-form** — structurally identical to `sale-form`'s items
  array (`applyEach`, add/remove rows via `addItem()`/`removeItem(i)`,
  `app-typeahead` for `catalogItemId` — catalog items *do* have a
  name-search API, unlike appointments/sales). Two differences from
  `sale-form`:
  - `priceApplied` is **always required** — unconditional `required()`
    plus the `/^\d{1,8}(\.\d{1,2})?$/` pattern validator (no
    "leave blank for catalog default" path).
  - Selecting a catalog item convenience-fills `priceApplied` with that
    item's `defaultPrice` directly into the model (editable, not just a
    placeholder) since it can't be left blank the way `sale-form`
    allows.
  - Items are entirely optional at the form level — zero rows valid (a
    plain note with no items).

### Submission

- Payload: `text`, ISO `date`, `appointmentId`/`saleId` (`undefined` if
  never touched on edit, explicit `null` if cleared, string if set —
  matches the DTO's tri-state), `items` (always the current full array,
  including on edit — the sub-form is the source of truth for the
  wholesale-replace PATCH semantics, same as anamnesis's `answers`).
- Submit button: `f().invalid() || f().submitting() || (isEditing() && !f().dirty())`,
  per `docs/CONVENTIONS.md`.
- Field-level server error mapping (`fieldErrorsByFieldId` from `ApiErrorDetail`)
  mirrors `customer-anamnesis-form-page`'s `toSaveError`.

## Detail page (`customer-followup-detail-page`)

`customerFollowup = input.required<CustomerFollowup>()` (from the
resolver, guarded by the ownership guard above). Shows text, date,
linked appointment/sale as links (labels resolved from the already-loaded
full record's `catalogItemName`/etc. — no extra fetch needed for those),
items table with a computed total (same `Big.js` reduction pattern as
`sale-form`'s `totalAmount`). Edit/delete actions gated the same as the
list row, same confirm-dialog delete flow as anamnesis's detail page.

## Deviations from the pre-backend FE-7 sketch

- **No item count/total column in the list.** The sketch (written before
  the backend existed) called for one, but the *shipped* list endpoint's
  rows have no `items` field — only the detail endpoint returns items.
  Fetching per-row items just for a list preview would mean N+1 requests
  per page. Dropped from the list; item total is shown only on the
  detail page, where the full record is already loaded.
- **`<select>` instead of `app-typeahead`** for the appointment/sale
  pickers, and a **sale-drives-appointment** relationship instead of
  independent pickers with submit-time cross-validation — both driven by
  the appointment/sale list APIs having no free-text search param, and
  by the fact that "the referenced sale's own appointmentId" is already
  present on list-item data, making a submit-time round trip
  unnecessary.

## New TODO items (not part of this build)

- **List item-total column**: revisit whether a cheap items-count/total
  is worth adding to the list row's backend response, if this becomes a
  real usability gap in practice (paired BE/FE item, low priority).
- Already tracked in the backend's `TODO.md`, not duplicated here:
  status/reminders (BE-30), post-completion prompt (BE-31).

## Out of scope (unchanged from backend spec)

- Follow-up status (pending/done) and reminders/notifications.
- Prompting to create a follow-up right after an appointment/sale is
  completed.
- Before/after photos (BE-8/FE-8).
