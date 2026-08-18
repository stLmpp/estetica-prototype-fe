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
- [ ] `appointments-calendar` (`calendar-month-grid`,
      `calendar-time-grid`) has no way to create an appointment by
      selecting a span of time directly on the grid — the only path to
      booking is the "Novo agendamento" button, which starts the
      multi-step wizard (`appointment-booking/`, steps: customer, service,
      professional, schedule, review) with nothing pre-filled. Add
      click-and-drag (or click-two-points) selection on the time grid to
      start that same wizard with the selected day/start-time/end-time
      (and, if the calendar is filtered to one professional via the
      existing `employeeId` filter in `AppointmentsCalendarStore`, that
      professional too) pre-filled — skipping straight to the `schedule`
      step's day picked, or further if enough is known. Needs a decision
      on how much of the wizard a pre-filled selection can skip, since
      today nothing passes initial values into it (no query-param/state
      pre-fill mechanism exists yet for `appointment-booking` at all).
      Month view is a click on a whole day, not a time range — decide
      whether it should jump into the day/week view at that date instead
      of trying to select a time span directly on month cells.
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
- [ ] No UI exists for customer follow-ups yet. Blocked on the backend TODO
      of the same name (`estetica-prototype-api`'s `TODO.md`) — the DB
      schema (`customer_followup`/`followup_item`: a dated note per
      customer with priced/quantified follow-up items underneath) exists,
      but there's no feature module or endpoints to build against yet.
      Once available, the natural place is a new `customer-followup-tab`
      alongside the existing `customer-details` tabs
      (`customer-anamnesis-tab`, `customer-appointments-tab`,
      `customer-sales-tab`, etc.) — actual UX/workflow (how a follow-up
      gets created, whether it's tied to a specific appointment/procedure,
      reminders) not designed yet.
- [ ] Custom colors per organization (branding). Blocked on the backend
      TODO of the same name (`estetica-prototype-api`'s `TODO.md`) —
      needs an org-level color field(s) exposed on `activeOrganization`
      first. Once available, `organization-settings.component.ts` is the
      natural place for the editing UI (same pattern as its existing
      `workingHours` form). The bigger open question is how a saved
      color actually reaches the UI at runtime: today `primary-*` is a
      hardcoded Tailwind palette referenced directly throughout every
      component's template (`text-primary-800`, `bg-primary-500`, etc.),
      not sourced from a runtime-configurable value — switching that to
      per-organization colors likely needs CSS custom properties
      (`--color-primary-*`) set on load from `activeOrganization`, with
      the Tailwind config/utility classes reading from those variables
      instead of fixed hex values. Needs a design pass on how many
      shades need to be derived from a single chosen color.
- [ ] Audit every `effect()` usage in the app (currently 15 files:
      `grep -rl 'effect(' src/app --include='*.ts'`) — a chunk of them feel
      like a workaround rather than something genuinely reactive/imperative
      by nature. The pattern that prompted this: `AnamnesisSectionFormComponent`,
      `AnamnesisFieldFormComponent`, and `CustomerAnamnesisFormPageComponent`
      (`routes/anamnesis-forms/anamnesis-form-detail/`,
      `routes/customers/customer-details/customer-anamnesis-tab/customer-anamnesis-form-page/`)
      all need an `effect()` + `untracked()` in the constructor just to seed
      a form's `model` signal from an optional `input()`, because Angular
      doesn't apply a bound input's value until after field initializers
      run — so `signal({ label: this.someInput()?.label ?? '' })` silently
      grabs the pre-binding default instead. `CustomerAnamnesisDetailPageComponent`
      in the same folder sidesteps this entirely with `linkedSignal(() =>
      this.customerAnamnesis())` (lazy, no effect needed) for the same kind
      of "seed local state from an input, but let it be
      locally-overridden-after" shape — worth checking whether `linkedSignal`
      can replace the effect-based seeding in the three components above,
      and more broadly whether it (or plain `computed()`) can replace other
      entries in that 15-file list. Distinguish genuine side effects (e.g.
      the router-query-param sync in `customers.component.ts`,
      `catalog-items.component.ts`, `employees.component.ts`,
      `anamnesis-forms.component.ts`) from signal-plumbing workarounds before
      deciding what actually needs to change.
- [ ] The customer-facing anamnesis pages (`routes/customers/customer-details/customer-anamnesis-tab/customer-anamnesis-form-page/`
      and `customer-anamnesis-detail-page/`) have a layout that's "all
      wrong" per direct feedback — flagged after only the admin builder side
      (`routes/anamnesis-forms/anamnesis-form-detail/`) got an actual
      browser pass this session; the customer-side pages were built/reviewed
      by reading code only. Needs a real browser walkthrough (create, edit,
      view, finalize a customer's anamnesis) to see what's actually broken,
      then a fix plan — don't guess at the problem from code alone.
- [ ] Anamnesis field options (RADIO/SELECT/CHECKBOX) ask the admin for both
      "Valor" and "Rótulo" per option, in `AnamnesisFieldFormComponent`
      (`routes/anamnesis-forms/anamnesis-form-detail/anamnesis-field-form/`).
      Direct feedback: this reads as a confusing double-definition to the
      admin filling out the field — most likely wants just one text input
      per option. Before collapsing it to one field, note *why* it's two
      today: `value` is the stable key an answer actually stores
      (`customer_anamnesis_field.value` for RADIO/SELECT,
      `extraValues.values[]` for CHECKBOX — see `AnamnesisFieldOption` in
      both `estetica-prototype-api` and this repo's
      `anamnesis-field.model.ts`), while `label` is just the display text —
      so renaming an option's label today doesn't orphan customers' already-
      recorded answers. Collapsing to a single field means the display text
      *is* the stored value, so relabeling an option later would silently
      change what past answers look like (or need to be treated as
      immutable once any answer references it). Decide whether that
      tradeoff is acceptable — if so, this is a paired FE (this repo) +
      backend (`estetica-prototype-api`, `AnamnesisFieldOption` model)
      change, not FE-only.
- [ ] No submit button in the app disables itself when the form is
      invalid. Checked all 13 `type="submit"` buttons in `src/app`: 5 gate
      only on `!f().dirty()` (e.g. `anamnesis-section-form.component.html:38`,
      `anamnesis-field-form.component.html:206`,
      `customer-anamnesis-form-page.component.html:180`,
      `anamnesis-form-detail.component.html:66`,
      `organization-settings.component.html:24`), the other 8 have no
      `[disabled]` binding at all (`customer-form-dialog`,
      `employee-form-dialog`, `catalog-item-form-dialog`, `sale-form`,
      `login`, `add-sale-transaction-dialog`,
      `customer-anamnesis-finalize-dialog`, `anamnesis-form-create`) — none
      check `f().invalid()`. It's a real, already-used signal
      (`FieldState.invalid: Signal<boolean>` in `@angular/forms/signals`) —
      `schedule-step.component.html:81` already disables a (non-submit)
      "Avançar" link with `[disabled]="f().invalid()"`, so the primitive is
      proven, just never applied to an actual submit button. Establish a
      standard (document it in `docs/CONVENTIONS.md` next to the existing
      Signal Forms rules) — likely `[disabled]="f().invalid() ||
      f().submitting() || (isEditing() && !f().dirty())"` or a shared
      helper/directive so every form doesn't hand-roll the same
      three-condition expression — then retrofit all 13 forms above to it.
- [ ] API error display is inconsistent across three different patterns for
      the same "a save/submit call failed" situation, despite
      `extractApiErrorMessage()` (`src/app/model/api-error.ts`, a pure
      string formatter, no display) being used 78 times to get the message:
      (1) `<app-alert error>` bound to a component error signal — e.g.
      `customer-info-form.component.html:70`, `sale-form.component.html:224`,
      `employee-details.component.html:35`/`68`; (2) a raw
      `<p role="alert">` with hand-written Tailwind classes that bypasses
      `app-alert` entirely — e.g. `customer-form-dialog.component.html:116`,
      plus `catalog-item-form-dialog`, `employee-form-dialog`,
      `organization-settings`, all three anamnesis inline forms
      (`anamnesis-section-form`, `anamnesis-field-form`,
      `anamnesis-form-create`), `customer-anamnesis-finalize-dialog`, and
      every `appointment-booking` step component; (3)
      `toastService.error(extractApiErrorMessage(...))` — only 4 call
      sites total (`customer-details.component.ts:86`,
      `sale-details.component.ts:125`,
      `appointment-details.component.ts:153`/`233`), even though
      `ToastService` is injected in ~24 components (almost always just for
      `.success(...)`). `docs/CONVENTIONS.md`'s own canonical save-handler
      example uses the toast pattern, but most actual submit handlers
      don't follow it — and `docs/DS.md` documents both `app-alert error`
      and `ToastService.error()` without ever saying which one a given
      situation should use. Decide a real rule (a plausible split: toast
      for one-shot submit/save failures since the form/dialog usually stays
      open or closes right after, `app-alert` for a load/list error that
      needs to stay visible while the user keeps looking at the page — but
      confirm this is actually the right split rather than assuming it),
      document it in `docs/CONVENTIONS.md`, then sweep every raw
      `<p role="alert">` instance above onto whichever standard is chosen.
- [ ] Success responses have no shared generic type on this side, unlike
      errors — `ApiErrorResponse`/`ApiError` (`src/app/model/api-error.ts`)
      already give every error response one global shape, but every
      `*.service.ts` (10 files, e.g. `anamnesis-field.service.ts`,
      `customer.service.ts`, `sale.service.ts`) hand-rolls its own
      `XResponse` interface with `data: {...}` inline instead of a shared
      wrapper. The backend has the generic version of this on its side —
      `createResponseSchema<T>`/`createPaginatedResponseSchema<T>`
      (`src/shared/model/response.model.ts` in `estetica-prototype-api`) —
      producing `{ data: T }` and `{ data: { items: T[] }, meta:
      PaginationMetadata }` respectively. Add matching generics here, e.g.
      `ApiResponse<T> = { data: T }` and `ApiPaginatedResponse<T> = { data:
      { items: T[] }, meta: PaginationMetadata }` (this repo already has
      `PaginationMetadata` globally in `src/app/shared/pagination.model.ts`,
      just not the wrapper). Note the generic only fits directly where a
      response's `data` is a single array/object matching `T` — several
      current responses key `data` by a feature-specific name instead (e.g.
      `ListAnamnesisFieldResponse`'s `data: { anamnesisFields: [...] }`), so
      migrating those means either renaming that key to match the generic's
      shape or accepting the generic only covers the common case.
- [ ] `HomeComponent` (`src/app/routes/home/`) is currently a placeholder
      that just dumps `authStore` via `JsonPipe`. Build a real home page: a
      dashboard of widgets (charts, stats like today's appointments,
      revenue, customer counts, etc.) — start with a hardcoded set/layout
      of widgets rather than building a drag-and-drop/configurable-layout
      system speculatively. Needs a charting library decision (none in
      `package.json` yet). Paired with the backend TODO of the same name in
      `estetica-prototype-api`'s `TODO.md` — the widgets need real
      aggregation endpoints to query, not existing per-entity list
      endpoints reshaped client-side.
- [ ] Split `docs/DS.md` into one `.md` per design-system component (e.g.
      `docs/ds/button.md`, `docs/ds/typeahead.md`, ...) once it gets
      unwieldy as a single file — noted inline in `docs/DS.md` itself too.
      Keep each one scoped to that component's actual inputs/outputs/usage,
      linked from an index in `docs/DS.md` rather than duplicating content.
