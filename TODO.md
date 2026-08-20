# TODO

Things noticed in passing that aren't worth stopping the current task for.
Pull from this list when there's no specific task in flight. Finished items
move to `TODO_DONE.md` instead of being deleted outright.

Each item has a stable ID (`FE-N`) for easy reference — keep the ID when an
item moves to `TODO_DONE.md`, and give any new item the next unused number
(highest across both files, plus one).

- [ ] **FE-1** Figure out the documentation story for the frontend. Right now there's
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
- [ ] **FE-2** `src/app/core/interceptors/small-ttl-cache.interceptor.ts` uses raw
      `console.log` in two places — the module-level legend printed once at
      load (the `symbolMap` entries logged on import) and every request
      inside `logRequest`. This interceptor runs on both platforms
      (`isPlatformServer(platformId)` is already checked elsewhere in the
      same file), so "a real logger" actually means two different delivery
      paths, not one drop-in replacement:
      - **Server-side (SSR) logs** are already running in this app's own
        Node process (`src/server.ts`, the Express app wrapping
        `AngularNodeAppEngine`) — no network hop needed, just swap
        `console.log` for a real Node logger there (e.g. `pino`, mirroring
        the shape of the backend's `LoggerService` in
        `estetica-prototype-api`) writing to that process's stdout.
      - **Client-side (browser) logs** have nowhere to land today beyond
        the user's own devtools console, invisible to anyone operating the
        app. Direct feedback (2026-08-19): send these to a new endpoint on
        *this app's own* SSR server (`src/server.ts` already has a
        commented-out slot for custom Express routes, registered before
        the catch-all Angular SSR handler) — **not** through
        `estetica-prototype-api`. Logging/observability is this app's own
        operational concern, not something the business API should have
        to own, authenticate against, or version alongside its actual
        domain routes. The browser-side logger posts entries to that
        endpoint (`fetch`/`HttpClient`, only when `isPlatformBrowser`), and
        the Express handler feeds them into the same Node logger used for
        SSR-side logs above — one sink, two origins.
      This is a self-hosted implementation, deliberately not a third-party
      error tracker (e.g. Sentry) — this app handles medical/aesthetic
      customer data, and owning the pipe end to end means error payloads
      never leave this app's own infrastructure in the first place.

      Open questions to settle before building this:
      - **User identification.** Every log entry (both origins) should
        carry the current user id when one exists, so an error can be
        traced back to who hit it — `AuthStore.session()?.user.id`
        (`src/app/core/auth/auth.store.ts`) is populated on both platforms
        (the session is resolved from the better-auth cookie during SSR
        bootstrap too, not just client-side), so it's available wherever
        the logger is called from. User id is enough — no need to also
        carry name/email/other session fields in the log payload itself.
        Omit the field entirely when logged out (public pages, failed
        login attempts) rather than logging a placeholder value.
      1. **Logging level conventions.** Decide the level set (e.g.
         `TRACE`/`DEBUG`/`INFO`/`WARN`/`ERROR`) and, more importantly, what
         actually gets logged at each one and which levels are worth their
         cost — not just naming them. The interceptor's current
         cache-hit/miss/inflight/transfer-state chatter is debug-level
         noise on every single request; only `WARN`/`ERROR` (real HTTP
         failures, uncaught exceptions via a global `ErrorHandler`) should
         ever leave the browser — `DEBUG`/`TRACE` stay local-console-only
         there. SSR-side can afford to log more since it's writing
         straight to its own process's stdout, no network cost per line.
         Document the final convention once decided
         (`docs/CONVENTIONS.md`).
      2. **Rate limiting** on the new endpoint — scoped to protecting the
         log pipe itself (disk, log-aggregator ingestion volume/cost), not
         business data, so it doesn't need to match the backend's
         per-tenant throttler design (still undecided anyway, see BE-3 in
         `estetica-prototype-api`'s `TODO.md`). A flat per-IP cap
         (`express-rate-limit` — this is a plain Express app, no NestJS
         throttler here) is enough.
      3. **Batch + `sendBeacon`.** Buffer client-side entries and flush
         every few seconds or N entries instead of one POST per log line —
         cheaper on the wire and smooths out bursts. Use
         `navigator.sendBeacon`/`fetch(url, { keepalive: true })` for the
         final flush on page unload specifically, since a plain in-flight
         `fetch` gets cancelled when the tab closes mid-request.
      4. **Payload size caps.** Cap message/stack length and batch size
         server-side, reject or truncate oversized ones — mostly to stop
         one bad error object (e.g. something that stringifies a huge
         object) from writing a multi-MB log line.
      5. **PII, given what this app stores.** This is a medical/aesthetic
         customer app — an uncaught exception's context can easily carry a
         request body or response with a customer's name/health info in
         it. Log an explicit allowlist (message, stack, URL, status code)
         rather than freely serializing whatever the error object happens
         to contain — raw request/response bodies and full error-object
         dumps don't get logged, regardless of level.
- [ ] **FE-4** `src/environments/environment.ts` hardcodes `api:
      'http://localhost:3000'` with no per-environment override. Needs real
      `environment.*.ts` files (or however this project wants to handle it)
      once there's a staging/production API URL to point at.
- [ ] **FE-5** `appointments-calendar` (`calendar-month-grid`,
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
- [ ] **FE-6** `appointment-details.component.ts`'s notes-editing form only lets
      `notes` be changed via `PATCH /v1/appointment/:id`, even though the
      backend also accepts `startTime`/`endTime` there (with
      conflict/working-hours validation server-side). Editing time was left
      out of the detail page deliberately — rescheduling needs the booking
      wizard's conflict/availability-aware slot picker
      (`appointment-booking/steps/schedule-step/`), which doesn't have an
      equivalent standalone widget yet. Add reschedule support once that
      exists, or extract a reusable version of the schedule-step picker.
- [ ] **FE-7** No UI exists for customer follow-ups yet. Blocked on the backend TODO
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
- [ ] **FE-8** Customer-followup before/after photos. Blocked on the backend TODO
      of the same name (`estetica-prototype-api`'s `TODO.md`) — needs the
      storage/upload design decided there first. Once available, the
      natural place is inside the future `customer-followup-tab` (see the
      customer-followup UI TODO above): an upload control per follow-up
      (likely two slots or a `BEFORE`/`AFTER` toggle, matching whatever
      the backend's `followup_photo.type` ends up being) and a viewer
      (side-by-side or a slider comparison) for reviewing existing photos.
      Actual upload flow (direct-to-bucket via presigned URL vs. through
      the API) depends on what the backend decides.
- [ ] **FE-9** Sale receipts (PDF) have no frontend surface — blocked on the
      backend TODO of the same name. Once an endpoint exists,
      `sale-details.component` is the natural place for a "Baixar recibo" /
      "Gerar recibo" action (mirroring the existing view/download actions
      elsewhere, e.g. `document`/`Ver venda` icon buttons in
      `appointments.component.html`). Since generation is meant to be
      idempotent server-side, the frontend action can be a plain
      link/download without its own loading-then-cache logic — confirm
      that holds once the backend's actual response shape (direct file vs.
      a URL to fetch) is decided.
- [ ] **FE-10** Custom colors per organization (branding). Blocked on the backend
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
- [ ] **FE-11** Audit every `effect()` usage in the app (currently 15 files:
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
- [ ] **FE-13** Anamnesis field options (RADIO/SELECT/CHECKBOX) ask the admin for both
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
- [ ] **FE-14** No submit button in the app disables itself when the form is
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
- [ ] **FE-15** API error display is inconsistent across three different patterns for
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
- [ ] **FE-16** Success responses have no shared generic type on this side, unlike
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
- [ ] **FE-17** `HomeComponent` (`src/app/routes/home/`) is currently a placeholder
      that just dumps `authStore` via `JsonPipe`. Build a real home page: a
      dashboard of widgets (charts, stats like today's appointments,
      revenue, customer counts, etc.) — start with a hardcoded set/layout
      of widgets rather than building a drag-and-drop/configurable-layout
      system speculatively. Needs a charting library decision (none in
      `package.json` yet). Paired with the backend TODO of the same name in
      `estetica-prototype-api`'s `TODO.md` — the widgets need real
      aggregation endpoints to query, not existing per-entity list
      endpoints reshaped client-side.
- [ ] **FE-18** Split `docs/DS.md` into one `.md` per design-system component (e.g.
      `docs/ds/button.md`, `docs/ds/typeahead.md`, ...) once it gets
      unwieldy as a single file — noted inline in `docs/DS.md` itself too.
      Keep each one scoped to that component's actual inputs/outputs/usage,
      linked from an index in `docs/DS.md` rather than duplicating content.
- [ ] **FE-23** ESLint config (`eslint.config.js`) currently has no stricter
      code-style/consistency rules beyond `@eslint/js` recommended,
      `typescript-eslint` recommended+stylistic, and Angular's recommended
      sets — no import ordering, member ordering, or naming-convention
      enforcement. Decide and adopt a stricter rule set — exact scope TBD.
      Paired with the backend TODO of the same name
      (`estetica-prototype-api`'s `TODO.md`, BE-28) since some of it (import
      ordering, naming conventions) is language-agnostic and worth deciding
      once for both repos, though each stack (Angular vs NestJS) will also
      need some rules of its own.

      One candidate already explored and reverted this session (2026-08-19):
      `eslint-plugin-perfectionist`'s `sort-classes` rule (enforces
      property/method visibility+kind ordering via a `groups` list). It
      works, but has a sharp edge worth knowing before re-adopting: the rule
      runs an always-on dependency-detection pass that is *not* gated by its
      `useExperimentalDependencyDetection` option — whenever a member's
      initializer references another member via `this.xxx(...)`, the rule
      treats that as a dependency and accepts the existing order as long as
      the dependency appears earlier, silently bypassing the configured
      `groups` order for that member. This collides directly with Angular's
      `computed()`/`effect()`/`linkedSignal()` idiom (166/19/6 usages as of
      this date), whose callbacks routinely reference `this.someSignal()` —
      e.g. `alert.component.ts`'s `protected readonly isDefault =
      computed(() => !this.success() && ...)` sat between two `public`
      properties with zero lint error. Fix: set
      `ignoreCallbackDependenciesPatterns: ['^computed$', '^effect$',
      '^linkedSignal$']` in the rule options — this excludes `this.`
      references found inside those specific callbacks from dependency
      detection, restoring normal group-based sorting (confirmed: surfaces
      61 real violations across `src`, all `eslint --fix`-able, once
      added). Re-apply that option if `sort-classes` gets picked back up.
