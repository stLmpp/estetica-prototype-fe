# Conventions

Code-level rules and patterns for this repository — how things are styled,
structured and written. `AGENTS.md` at the repo root covers how an agent
should operate here (tooling, persona); this document covers the actual
coding conventions it points to.

## Styling and UI

- Use Tailwind CSS for all styling.
- Follow Tailwind best practices (utility-first, avoid arbitrary values when possible).
- All components MUST support dark and light mode.
- Use the project's color palette defined in `src/styles.css`:
  - **Primary**: Rosa Queimado / Bordô (`primary-50` to `primary-900`).
  - **Neutral**: Creme / Pêssego (`neutral-50` to `neutral-900`).
- Always prefer components from the design system (`src/app/components`) over creating new UI elements:
  - Use `[btn]`, `[btnPrimary]`, `[btnSecondary]`, `[btnOutline]` for buttons.
  - Use `app-form-field`, `appLabel`, `appInput` for forms.
  - Use `app-alert` for notifications.
  - Check `src/app/components` for other available components (badge, checkbox, chip, switch, table, etc.).

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
- Prefer `function` declarations over arrow functions for top-level/global functions (e.g. route guards, resolvers, standalone utilities). Reserve arrow functions for callbacks, higher-order functions, and other inline/nested usages.
- Add an explicit return type whenever it can't be inferred — most notably Angular-specific functional constructs (guards, resolvers, interceptors, etc.), where the exported function should return the Angular type rather than being typed as it directly:
  ```ts
  export function requireAuthenticatedGuard(): CanActivateFn {
    return (route, state) => {
      /* ... */
    };
  }
  ```
  Omit the annotation when the return type is already obvious/inferable (e.g. the function just delegates to another already-typed call) — don't add a redundant explicit type.

## Code Comments

- Only add a comment when it's absolutely necessary to explain **why** something was done a certain way (a non-obvious constraint, a workaround, a trade-off). Never add a comment that just restates **what** the code does.
- Write self-explanatory code instead: readable variable/function names, small focused functions, and a clear top-to-bottom flow should make the code understandable without narration.
- If you feel the need to explain what a block does, prefer extracting it into a well-named function/variable over adding a comment.

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.
- Always wrap Angular functional constructs (guards, resolvers, interceptors, etc.) in a factory function that returns the typed function, even when it currently takes no parameters — don't export the typed function directly. This makes it trivial to add options/parameters later without changing the shape at every call site:
  ```ts
  export function requireAuthenticatedGuard(): CanActivateFn {
    return () => {
      /* ... */
    };
  }
  ```
  Used as `canActivate: [requireAuthenticatedGuard()]`.
- Avoid calling `.subscribe()` yourself; prefer declarative alternatives that let Angular own the subscription (and its cleanup) instead: the async pipe in templates, `toSignal()`/`toObservable()` for signal interop, returning the Observable directly from a router guard/resolver (the Router subscribes and unsubscribes for you), and `rxMethod()` inside a SignalStore (see State Management below). If nothing framework-owned fits, a manual `.subscribe()` is the last resort — pair it with `takeUntilDestroyed()` so it doesn't outlive the component/service.

## Authorization

Permission/role checks mirror the backend's `has-permission.decorator.ts` for full type safety — a typo'd resource or action fails to compile, on both sides.

- `core/auth/admin-access-control.ts` and `core/auth/organization-access-control.ts` mirror the backend's access-control definitions 1:1 (same resources/actions/roles). They're duplicated by hand rather than shared, since the FE and API are separate repos — keep them in sync whenever the backend's versions change.
- Express a permission requirement as a `HasPermissionOptions` object (`core/auth/has-permission.ts`) — `{ permissions }`, `{ orgPermissions }`, `{ roles }`, `{ orgRoles }`, or an `or`/`and` combination of those — the same shape as the backend's `@HasPermission` decorator (`HasPermissionOptionsV2`).
- Route level: use the `hasPermissionGuard(options)` factory alongside the other auth guards (see the Angular functional constructs rule above).
- Template level: expose a `computed()` signal on the component (e.g. `canCreateCatalogItem = computed(() => authStore.hasPermission({ ... }))`) and gate the element with `@if`. Don't call `authStore.hasPermission()` directly inline in a template expression — it re-evaluates every change-detection cycle and re-allocates the check object each time.
- For content declared directly in a template, `@defer` can double as an authorization boundary: wrap it behind the same `computed()` signal (`@defer (when canCreateCatalogItem())`) so the chunk itself is never fetched for a user without access, not just hidden after loading. See the `@defer` section below.
- This only applies to template-declared content — a component opened imperatively (e.g. via CDK `Dialog.open()`) has no template presence for `@defer` to attach to. Use `DialogService`'s lazy-component overload for those instead (see Services).
- The frontend check is a UX convenience, never the security boundary — the backend's guard re-validates every request regardless of what the client decided. Don't skip or weaken a backend check because the frontend already gates it.

## Server-Side Rendering (SSR)

This app is server-rendered (`provideClientHydration()` in `app.config.ts`). Every feature MUST be built with SSR in mind, not just verified in the browser — the server render is what search engines and first-paint performance depend on, so a route that only becomes meaningful after client-only code runs defeats the purpose of SSR.

- Never reference browser globals (`window`, `document`, `localStorage`, `sessionStorage`, `navigator`, etc.) at the top level of a component/service/directive constructor or field initializer — they don't exist on the server and will throw during SSR.
- Only use browser APIs once you've confirmed you're actually in the browser:
  - For code that must run once, after the view is in the DOM (reading `document`, sizing elements, etc.), use `afterNextRender()`/`afterRender()` — it never runs on the server.
  - For conditional logic that needs to differ between server and client (not just "skip on server"), inject `PLATFORM_ID` and branch with `isPlatformBrowser()` / `isPlatformServer()` from `@angular/common`. See `header.component.ts`'s theme handling for the pattern: read the initial theme from `SsrCookieService` on the server, then reconcile with `document.documentElement` inside `afterNextRender()` on the client.
- Prefer SSR-safe abstractions over raw browser APIs so code works unmodified on both sides:
  - Use `Renderer2` (not direct DOM manipulation) when a component/directive needs to create or mutate DOM nodes — see `LoadingOverlayDirective`.
  - Use `SsrCookieService` (`ngx-cookie-service-ssr`) instead of `document.cookie` for cookie access.
- When an HTTP call made during SSR needs the incoming request's cookies (e.g. for auth), inject Angular's `REQUEST` token and forward the relevant headers — see `with-credentials.interceptor.ts` and `small-ttl-cache.interceptor.ts`.
- Use `TransferState` to pass data fetched during SSR to the client instead of re-fetching it after hydration — see the app initializer in `app.config.ts` and `small-ttl-cache.interceptor.ts`.
- Before considering a feature done, sanity-check that its route actually renders real content server-side (view source / disable JS), not just an empty shell that only fills in client-side.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Must NOT set `changeDetection: ChangeDetectionStrategy.OnPush`, it's ON by default
- Prefer inline templates for small components
- Use Angular Signal Forms (`@angular/forms/signals`) for every form. Do NOT use `ReactiveFormsModule`/`FormGroup`/`FormControl` or template-driven forms (`ngModel`).
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.
- Favor declarative code: derive values with `computed()` and react to state changes with `effect()`, instead of imperative methods that recompute something on demand (e.g. a `getX()` called from another field's initializer). A declarative derivation re-runs automatically whenever its signal dependencies change and isn't sensitive to class field/method declaration order; an imperative method only reflects the latest state when something remembers to call it again.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead
- For state shared across a route/feature (e.g. a list page and the create/edit dialog it opens), use an NgRx SignalStore (`@ngrx/signals`) instead of ad-hoc services or component-level effects:
  - Build the store with `signalStore()` composed from `withState`, `withComputed`, and `withMethods`. Use `withEntities()` (`@ngrx/signals/entities`) for collections instead of a plain array in state.
  - Update state only through `patchState()` and the entity updaters (`setAllEntities`, `addEntity`, `updateEntity`, `removeEntity`, `prependEntity`, etc.). Never mutate store state directly.
  - Provide feature stores at the component level (`providers: [MyStore]`), not `providedIn: 'root'`, unless the state is genuinely app-wide.
  - Wrap async side effects (HTTP calls, debounced search, etc.) in `rxMethod()` (`@ngrx/signals/rxjs-interop`) rather than driving them from a manual `effect()` in a component. Use `signalMethod()` instead when the side effect is synchronous and doesn't need RxJS operators.
  - Connect a store's `rxMethod`/`signalMethod` reactively by calling it with a `Signal`/`computed()` (typically from `withHooks({ onInit })`), so state changes drive the effect declaratively — don't call the store's action methods imperatively from a component `effect()` just to trigger a refetch.
  - When a store needs both a one-off, awaitable load (e.g. from a router resolver, which needs a real `Observable` to block navigation on) and a reactive reload driven by a signal/form field changing, don't duplicate the fetch or force one caller to work around the other's shape — extract the fetch into a private function inside the `withMethods` factory closure and expose it two ways: raw, for imperative/resolver callers that need the `Observable` back; and wrapped in `rxMethod()`, for reactive callers. Use `tapResponse({ next, error })` (`@ngrx/operators`) instead of `tap()` + `catchError()` inside the private function — a plain `catchError` that doesn't return a replacement observable would kill the shared source on the first error, taking the `rxMethod` down with it. Connect the reactive variant by feeding it the caller's signal — `store.loadX(toObservable(field).pipe(skip(1)))` when a resolver/initial load already covers the current value and only later changes should trigger a reload, or a plain `Signal`/`computed()` otherwise. Never `.subscribe()` it manually.
    ```ts
    withMethods((store, service = inject(SomeService)) => {
      function fetchX(id: string) {
        patchState(store, { loading: true, errorMessage: null });
        return service.getX(id).pipe(
          tapResponse({
            next: (x) => patchState(store, { x, loading: false }),
            error: (error: unknown) =>
              patchState(store, { loading: false, errorMessage: extractApiErrorMessage(error) }),
          }),
        );
      }

      return {
        fetchX, // resolver: `return store.fetchX(id)`
        loadX: rxMethod<string>(pipe(switchMap(fetchX))), // component: `store.loadX(toObservable(idSignal).pipe(skip(1)))`
      };
    }),
    ```
  - If a component that provides a store opens an Angular CDK `Dialog`, pass `injector: this.injector` (via `inject(Injector)`) in `Dialog.open()`'s config. CDK Dialog otherwise resolves the dialog content against the root injector, which cannot see component-level providers like the store.

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Use `@let` to name a signal read or a repeated condition once per template/block instead of calling the same signal or re-evaluating the same expression multiple times (e.g. `@let isSelected = value() === option.id;`, then reuse `isSelected` in every binding that needs it).

### Deferred Loading (`@defer`)

Use `@defer` to split a template's heavy or non-critical dependencies (their component classes, and everything those components import) into a separate JS chunk that's fetched later instead of in the initial bundle. It exists to shrink what has to be downloaded/parsed/executed before the page is usable — smaller initial bundle, faster first load, better Core Web Vitals (LCP/TBT).

- Reach for it around content that isn't needed for the initial view: below-the-fold sections, secondary widgets, heavy components (charts, rich text editors, large third-party embeds), or anything gated behind user action.
- Also reach for it around content gated behind a permission check — see the Authorization section above. `@defer (when canDoX())` keeps the chunk from ever being fetched for a user who can't see it, not just deferred-then-shown. This only works for content declared in the template; use `DialogService`'s lazy overload for permission-gated dialogs opened imperatively.
- Pick the trigger to match why you're deferring:
  - `on viewport` — below-the-fold content that should load as the user scrolls to it.
  - `on interaction` / `on hover` — content tied to a specific element the user hasn't engaged with yet.
  - `on idle` (the default) — non-critical content that should still load soon, just not before the main view.
  - `on timer(Xms)` — rarely; prefer an explicit trigger over an arbitrary delay.
  - `when <condition>` — drive it off a signal/expression when none of the built-in triggers fit.
- Pair it with `@placeholder`, `@loading`, and `@error` sub-blocks so there's no layout jump and the user gets feedback while the chunk loads, instead of leaving a hole in the page.
- Do NOT defer content that's needed for the initial render or interaction to make sense (e.g. primary page content, anything above the fold).
- SSR caveat (see the SSR section above): Incremental Hydration is enabled by default in this app (`provideClientHydration()` has it on unless `withNoIncrementalHydration()` is added), but it only kicks in for a given `@defer` block if that block has an explicit `hydrate on`/`hydrate when`/`hydrate never` trigger. A `@defer` block with only a regular trigger (`on viewport`, `on idle`, etc. — no `hydrate` trigger) still renders just its `@placeholder` on the server, same as without incremental hydration.
  - For content that's below the fold or truly non-critical, a regular trigger with no `hydrate` trigger is fine — the placeholder-then-swap behavior is expected there.
  - For SEO-critical or above-the-fold content you still want to defer the JS for, add a `hydrate` trigger (e.g. `@defer (hydrate on idle)`) so Angular renders the real content server-side and only defers *hydrating* it — content is visible/crawlable immediately, with no layout shift, while the JS still loads lazily.

## Services

- Design services around a single responsibility
- Use the `@Service()` decorator for singleton services
- Use the `inject()` function instead of constructor injection

### Dialogs

Use `DialogService` (`core/dialog/dialog.service.ts`) instead of injecting CDK's `Dialog` directly. It wraps `Dialog.open()` with the same API, plus an overload that accepts a lazy loader (`() => import('./x.component').then((m) => m.XComponent)`) instead of an eager component class — returning `Promise<DialogRef<...>>` in that case — so a dialog's code can be code-split without extra ceremony when it's worth it (see the Authorization and `@defer` sections for when that's the case).
