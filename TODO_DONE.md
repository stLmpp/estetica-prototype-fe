# TODO (done)

Completed items moved out of `TODO.md`, kept for history instead of deleted
outright.

- [x] `ConfirmDialogComponent`'s old fixed confirm/cancel API was replaced by
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
