You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

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
  - If a component that provides a store opens an Angular CDK `Dialog`, pass `injector: this.injector` (via `inject(Injector)`) in `Dialog.open()`'s config. CDK Dialog otherwise resolves the dialog content against the root injector, which cannot see component-level providers like the store.

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
