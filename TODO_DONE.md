# TODO (done)

Completed items moved out of `TODO.md`, kept for history instead of deleted
outright.

- [x] **FE-19** (2026-08-18) Every Signal Forms form with a `type="number"` input
      modeled that field as `string` in its form model, converting with
      `Number(...)` only when building the API payload, out of an
      unverified assumption that Signal Forms' native `<input>` support
      might not bind a `number`-typed field to `type="number"` cleanly.
      Verified against `@angular/forms/signals`' own source
      (`getNativeControlValue`/`setNativeControlValue` in
      `node_modules/@angular/forms/fesm2022/signals.mjs`): `type="number"`
      inputs read/write via `element.valueAsNumber` natively against a
      `number | null` model field — the string-everywhere pattern was
      habit, not a requirement. Migrated every plain-integer field to
      `number | null`: `defaultDuration` in
      `catalog-item-form-dialog.component.ts`, `durationMinutes` in
      `appointment-booking.store.ts`/`schedule-step.component.ts`/
      `review-step.component.ts`, and `quantity`/`installmentCount` in
      `sale-form.component.ts` — plus `installmentCount` in
      `add-sale-transaction-dialog.component.ts`, which had the identical
      pattern but wasn't in the original TODO's file list. Left
      money/currency fields (`priceApplied`, `amount`, etc.) as `string`,
      since those genuinely need to stay strings end-to-end (Postgres
      `numeric` columns come back as strings from drizzle to avoid
      floating-point precision loss). Verified in-browser: catalog-item
      duration edit (pre-filled, edited, saved, round-tripped correctly)
      and sale-form quantity (default 1, total recalculates correctly on
      change).

- [x] **FE-20** `ConfirmDialogComponent`'s old fixed confirm/cancel API was replaced by
      an `actions: ConfirmDialogAction[]` array, where each action carries
      its own `btn`-style variant flags and an optional `onClick` callback
      returning `MaybeAsync<R>` (same shape as a router resolver); the
      dialog puts the clicked action's button into `btnLoading`, disables
      every other action and `dialogRef.disableClose` while it's in flight,
      and closes with the callback's resolved value on success (stays open,
      clears loading, logs to console on error). This started life as a
      separate `ConfirmDialogV2Component` deprecating the old one, and was
      renamed back to `ConfirmDialogComponent` once every call site had
      migrated and the old implementation was deleted. All 7 call sites now
      go through the new `DialogService.openConfirm()` helper (lazy-imports
      the component and defaults `size`/`role`/`ariaModal`/`ariaLabelledBy`,
      so call sites just pass `data`):
      - `src/app/routes/customers/customers.component.ts`
      - `src/app/routes/catalog-items/catalog-items.component.ts`
      - `src/app/routes/sales/sales.component.ts`
      - `src/app/routes/sales/sale-details/sale-details.component.ts`
      - `src/app/routes/appointments/appointments.component.ts`
      - `src/app/routes/appointments/appointment-details/appointment-details.component.ts`
      - `src/app/routes/employees/employees.component.ts`
- [x] **FE-21** (2026-08-18) `appointments-calendar` entries had no actions — clicking
      one did nothing. Made every entry in both grid views
      (`calendar-month-grid`, `calendar-time-grid`) a `RouterLink` to
      `/appointments/:appointmentId`, matching the existing "Ver
      agendamento" row action on the list page, plus a `hover:opacity-80`
      affordance. Whether the calendar also wants inline quick-actions
      (without leaving the calendar view) is still open, not addressed
      here. Verified in-browser after a dev-server restart (a stale
      Vite/dependency-optimization state had made `GET
      /v1/appointment/:id` fail client-side app-wide, unrelated to this
      change).
- [x] **FE-22** (2026-08-18) `AnamnesisFieldService.list()` talked to a paginated
      backend endpoint (`page`/`limit` up to 100), faked by both call sites
      hardcoding `limit: FIELDS_LIMIT = 100`. Backend's paired TODO made
      `GET /v1/anamnesis-field` return a flat array; updated
      `ListAnamnesisFieldFilter` (dropped `page`/`limit`) and
      `AnamnesisFieldService.list()` to match (returns `AnamnesisField[]`
      directly instead of `{items, meta}`), and simplified both call sites
      (`AnamnesisFormDetailStore.reload`,
      `CustomerAnamnesisFormPageComponent.loadFieldsForForm$`) — no more
      `.pipe(map((result) => result.items))`, no more `FIELDS_LIMIT`.
