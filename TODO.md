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
