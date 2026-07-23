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
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
