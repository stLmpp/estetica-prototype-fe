# TODO

Things noticed in passing that aren't worth stopping the current task for.
Pull from this list when there's no specific task in flight. Finished items
move to `TODO_DONE.md` instead of being deleted outright.

- [ ] Figure out the documentation story for the frontend. Right now there's
      `AGENTS.md` + `docs/CONVENTIONS.md` (code-level rules) but nothing like
      the backend's `docs/features/<feature>/{FUNCTIONAL,DATABASE}.md`
      per-feature docs (see `estetica-prototype-api`'s `docs/CONVENTIONS.md`
      → **Cross-feature access** and the `docs/features/_templates/` for
      what that looks like there). The backend's split doesn't map directly
      — there's no DB schema on this side — so this needs its own shape:
      likely something oriented around routes/state (stores, route guards,
      what a feature's UI is actually supposed to do) rather than
      functional/database. Decide the structure, then backfill the features
      that already exist (customer, employee, catalog-item, appointment,
      organization settings, etc.).
- [ ] `src/app/core/interceptors/small-ttl-cache.interceptor.ts` uses raw
      `console.log` in two places — the module-level legend printed once at
      load (the `symbolMap` entries logged on import) and every request
      inside `logRequest`. Route both through a real logger once one exists
      on this side (mirroring the backend's `LoggerService`), rather than
      leaving debug output on `console` in production builds.
- [ ] `src/app/components/form-field/form-field.component.ts`'s
      `ngAfterContentInit` throws a plain `new Error('InputDirective is
      required')` when no `FormFieldInput` is projected. Improve this —
      at minimum a clearer message (which component/template it's missing
      from), possibly a dev-mode-only warning instead of a hard throw.
- [ ] `src/environments/environment.ts` hardcodes `api:
      'http://localhost:3000'` with no per-environment override. Needs real
      `environment.*.ts` files (or however this project wants to handle it)
      once there's a staging/production API URL to point at.
- [ ] `src/app/routes/appointments/appointments-calendar` has no actions on
      calendar entries yet — clicking an entry should at minimum link to
      `/appointments/:appointmentId` (`appointment-details/`, added
      alongside the list's row-level view action), which now covers
      view/edit-notes/status-update/delete/sale-link in one place. Whether
      the calendar also wants inline quick-actions (without leaving the
      calendar view) is still open.
- [ ] `appointment-details.component.ts`'s notes-editing form only lets
      `notes` be changed via `PATCH /v1/appointment/:id`, even though the
      backend also accepts `startTime`/`endTime` there (with
      conflict/working-hours validation server-side). Editing time was left
      out of the detail page deliberately — rescheduling needs the booking
      wizard's conflict/availability-aware slot picker
      (`appointment-booking/steps/schedule-step/`), which doesn't have an
      equivalent standalone widget yet. Add reschedule support once that
      exists, or extract a reusable version of the schedule-step picker.
- [ ] Every Signal Forms form with a `type="number"` input models that field
      as `string` in its form model, converting with `Number(...)` only when
      building the API payload — see `defaultDuration` in
      `catalog-item-form-dialog.component.ts`, `durationMinutes` in
      `appointment-booking.store.ts`, and `quantity`/`installmentCount` in
      `sale-form.component.ts` (added copying that same pattern, since it
      was the only precedent found at the time). That makes sense for
      money/currency fields (`priceApplied`, `amount`, etc.) — the API
      itself represents those as strings, since the backend's Postgres
      `numeric` columns come back as strings from drizzle to avoid
      floating-point precision loss — but plain integer fields (quantity,
      duration in minutes, installment count) don't have that precision
      concern; JS `number` represents them exactly, and the backend DTOs
      already type them as `number` on the wire (see `sale.dto.ts`'s
      `SaleItemPayload.quantity: number`). Figure out whether the
      string-everywhere pattern was a deliberate choice (e.g. Angular
      Signal Forms' native `<input>` support doesn't cleanly bind a
      `number`-typed field to `type="number"` — unverified either way) or
      just copied from the currency-field pattern out of habit. If
      `number` binds fine, migrate every integer-typed form field to it and
      reserve `string` model fields for genuinely string-shaped API values
      (money, dates, ids) — across all the forms listed above, not just
      new ones.
- [ ] Split `docs/DS.md` into one `.md` per design-system component (e.g.
      `docs/ds/button.md`, `docs/ds/typeahead.md`, ...) once it gets
      unwieldy as a single file — noted inline in `docs/DS.md` itself too.
      Keep each one scoped to that component's actual inputs/outputs/usage,
      linked from an index in `docs/DS.md` rather than duplicating content.
