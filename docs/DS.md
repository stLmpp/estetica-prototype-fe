# Design System

Usage guide for the components in `src/app/components/` — what each one is
for, its key inputs/outputs, and a minimal usage snippet. `docs/CONVENTIONS.md`
→ **Styling and UI** covers the *rules* (Tailwind-first, dark mode required,
prefer these components over ad hoc markup); this document covers *how to use
each one*.

A live, interactive showcase of a subset of these components exists at the
`/ds` route (`src/app/ds.component.ts`) — useful for eyeballing states, but it
isn't exhaustive and isn't a substitute for reading a component's actual
inputs/outputs before using it.

**TODO: split into one `.md` per component** (e.g. `docs/ds/button.md`,
`docs/ds/typeahead.md`, ...) once this file gets unwieldy — for now everything
lives here as a single reference.

Every component/directive below is standalone — import it directly into your
component's `imports: []` array, there's no shared module.

## Conventions shared across most form controls

- Anything meant to plug into `@angular/forms/signals` implements
  `FormValueControl<T>` (`value` as a `model()`) or, for native `<input>`/
  `<select>` elements, extends `FormFieldInput` via `InputDirective`/
  `SelectDirective` so `[formField]` can bind to them directly. Wrap a
  labeled field in `<app-form-field>` with an `<label appLabel>` and the
  control inside — see **Form field** below. Never wrap something in
  `<app-form-field>` with no `appInput`/`appSelect`/`FormFieldInput`-derived
  child; it throws (`ngAfterContentInit`) if none is projected.
- Boolean-style inputs (`disabled`, `btnPrimary`, etc.) use `transform:
  booleanAttribute` so they work as either `[disabled]="expr()"` or the bare
  attribute `disabled`.

## Buttons & icons

### Button (`btn`)

Attribute directive on a native `button[btn]` or `a[btn]` — not a wrapper
component, so it works on links too (e.g. a `routerLink` styled as a button).

```html
<button btn btnPrimary type="submit" [btnLoading]="saving()">Salvar</button>
<a btn btnOutline routerLink="/customers">Cancelar</a>
```

- Variant: `btnPrimary` / `btnSecondary` / `btnOutline` (omit all three for
  the default/ghost style).
- `btnLoading` swaps in a spinner (debounced by `btnLoadingShowDelay`, default
  200ms, so it doesn't flash on fast requests) and disables the button.
- `disabled` — on `a[btn]` this isn't just CSS: it also blocks pointer events
  and Enter/Space, since anchors have no native disabled state.

### Icon (`app-icon`)

```html
<app-icon [icon]="LucideTrash2" size="sm" color="error" />
```

- `icon` (required) — a `LucideIconInput` (import the icon from
  `@lucide/angular`; use the `lucide-icons` skill to find the right name).
- `size`: `'xs' | 'sm' | 'md' | 'lg' | 'xl'` (default `'md'`).
- `color`: `'primary' | 'neutral' | 'success' | 'error' | 'warning' | 'info' |
  'white' | 'inherit'` (default `'inherit'`).

### Icon button (`iconBtn`)

Same idea as `btn`, but icon-only, on `button[iconBtn]`/`a[iconBtn]`. Same
`btnPrimary`/`btnSecondary`/`btnOutline`/`btnLoading`/`disabled` inputs as
`btn`, plus:

```html
<button iconBtn [icon]="LucideTrash2" ariaLabel="Remover item" size="sm" (click)="remove()"></button>
```

- `icon` (required), `ariaLabel` (required — icon-only buttons need it), `size`.

### Button toggle group (`app-button-toggle-group` / `btnToggle`)

Radio-style single-select rendered as connected pill buttons. Implements
`FormValueControl`.

```html
<app-button-toggle-group [formField]="f.buttonToggle" label="Área">
  <button btnToggle value="corporal">Corporal</button>
  <button btnToggle value="facial">Facial</button>
</app-button-toggle-group>
```

- Group: `label` (aria-label), `disabled`.
- Each `button[btnToggle]`: `value` (required), `disabled`. First non-disabled
  toggle auto-selects if nothing is selected on init.

## Form controls

### Form field (`app-form-field` / `appLabel`)

Layout wrapper that pairs a `<label appLabel>` with one projected
`FormFieldInput` (an `appInput`/`appSelect` element, or any component that
extends `FormFieldInput`/provides it — `app-checkbox`, `app-switch`, etc.),
and surfaces that control's first validation error underneath automatically.

```html
<app-form-field>
  <label appLabel for="customer-name">Nome</label>
  <input appInput [formField]="f.name" id="customer-name" type="text" />
</app-form-field>
```

- Throws if no `FormFieldInput` is projected — don't wrap static text or a
  conditionally-absent control in it (branch the whole `<app-form-field>` in
  the template instead, or don't use it for non-form content at all).
- `LabelComponent` (`appLabel`) has a `required` state, set automatically from
  the paired control's schema — you don't set it by hand.

### Input (`appInput`)

Attribute directive for `input[appInput]` (any type except
checkbox/radio/file/range/button/submit/reset — those have their own
components). Style/validation-state (red border) come for free; pair with
`[formField]` and, for money fields, `ngx-mask`:

```html
<input appInput [formField]="f.priceApplied" type="text" inputmode="decimal" mask="separator.2" prefix="R$ " />
```

Numeric fields (`type="number"`) are modeled as `string` in the form model
in this codebase (converted with `Number(...)` at submit) — see
`docs/CONVENTIONS.md`. Note `min`/`max` HTML attributes are **not** allowed
together with `[formField]` (Angular throws `NG8022`); use the Signal Forms
`min()`/`max()` schema functions instead (which require a `number`-typed
field) or a custom `validate()`.

### Select (`appSelect`)

Same idea as `appInput`, for `select[appSelect]`:

```html
<select appSelect [formField]="f.status" id="status-filter">
  <option value="">Todos</option>
  @for (status of statusOptions; track status) {
    <option [value]="status">{{ status }}</option>
  }
</select>
```

### Checkbox (`app-checkbox`) / Switch (`app-switch`)

`app-switch` is `app-checkbox` with different styling (toggle pill instead of
a box) — identical API. Both implement `FormCheckboxControl`, content-project
the label text:

```html
<app-switch [formField]="f.active">Ativo</app-switch>
```

- `checked` (model, boolean), `disabled`.
- Not wrapped in `<app-form-field>` in existing usage — they render their own
  label via content projection instead.

### Typeahead (`app-typeahead`)

Async single-select search field (CDK Overlay + `ActiveDescendantKeyManager`,
not a hand-rolled dropdown). Implements `FormValueControl<string | null>`, so
it works with `[formField]` directly, or standalone with `(itemSelected)`
when you need the full selected object (not just its id):

```html
<app-typeahead
  [formField]="f.customerId"
  [searchFn]="customerSearchFn"
  [initialItem]="customerInitialItem()"
  label="Cliente"
  placeholder="Buscar cliente por nome"
  emptyMessage="Nenhum cliente encontrado."
/>
```
```ts
protected readonly customerSearchFn = (query: string) =>
  this.customerService.list({ name: query, limit: 10 }).pipe(
    map((result) => result.items.map((c) => ({ id: c.id, label: c.name }))),
  );
```

- `searchFn` (required) — `(query: string) => Observable<TypeaheadItem[]>`
  (`TypeaheadItem = { id: string; label: string }`).
- `initialItem` — seeds the selected chip **once, at construction**; not
  reactive after that. If it depends on async data (e.g. a resolved route
  param), gate the typeahead behind that data being loaded so it isn't
  constructed before `initialItem` has a real value.
- `minQueryLength` (default 1), `emptyMessage`, `disabled`.
- `itemSelected` output fires with the full `TypeaheadItem | null` — use this
  when you need more than the id (e.g. to also read a catalog item's
  `defaultPrice` on selection).

### Listbox (`app-listbox` / `app-listbox-option`)

Single-select list built directly on CDK's `CdkListbox`/`CdkOption` (both
components just `extends`/re-provide the CDK class for styling — not a
`FormValueControl`, so use CDK's own inputs/outputs, not custom ones):

```html
<app-listbox aria-label="Serviços" [cdkListboxValue]="selectedServiceIds()" (cdkListboxValueChange)="onServiceChange($event)">
  @for (option of options(); track option.id) {
    <app-listbox-option [cdkOption]="option.id">{{ option.name }}</app-listbox-option>
  }
</app-listbox>
```

- Read the emitted value as `ListboxValueChangeEvent<T>` (`@angular/cdk/listbox`).

### Multi-select badges (`app-multi-select-badges`)

Toggleable badge group for a small, fixed set of multi-select options.
Implements `FormValueControl<T[]>`:

```html
<app-multi-select-badges [formField]="f.tags" [options]="tagOptions" />
```

- `options` (required) — `{ value: T; label: string; variant?: 'primary' |
  'secondary' | 'default' }[]`.

### Transfer list (`app-transfer-list`)

Two-pane picker (available ↔ selected) with per-side search and bulk
move-all — used for e.g. assigning services to an employee. Implements
`FormValueControl<string[]>`:

```html
<app-transfer-list
  [formField]="f.catalogItemIds"
  [items]="services()"
  leftLabel="Serviços disponíveis"
  rightLabel="Serviços do profissional"
/>
```

- `items` (required) — `{ id: string; label: string }[]`, the *full* set;
  membership in `value` determines which side an item is on.

### Calendar (`app-calendar`)

Single-date picker, month grid. Implements `FormValueControl<string>` (ISO
date `YYYY-MM-DD`):

```html
<app-calendar [formField]="f.date" [minDate]="minDate" />
```

- `minDate` — dates before it render disabled.

### Working hours editor (`app-working-hours-editor`)

Per-weekday open/closed + start/end time editor. Implements
`FormValueControl<WeeklyWorkingHours>` (`src/app/model/working-hours.model.ts`).
Typically the form's model *is* a `WeeklyWorkingHours` directly (not nested
under a wrapper key), so `[formField]` binds the whole form:

```ts
protected readonly workingHoursModel = linkedSignal<WeeklyWorkingHours>(() => employee()?.workingHours ?? EMPTY_WEEKLY_WORKING_HOURS);
protected readonly workingHoursForm = form(this.workingHoursModel);
```
```html
<form [formRoot]="workingHoursForm">
  <app-working-hours-editor [formField]="workingHoursForm" />
</form>
```

## Feedback

### Alert (`app-alert`)

```html
<app-alert error>{{ errorMessage() }}</app-alert>
<app-alert success showClose (clickClose)="dismiss()">Salvo!</app-alert>
```

- Variant: `success` / `error` / `brand` (omit all for the neutral/primary
  default). `showClose` + `clickClose` for a dismiss button.

### Toast (`ToastService`)

Not a template component — inject the service and call it; a
`ToastContainerComponent` is attached to a CDK overlay lazily on first use.

```ts
private readonly toastService = inject(ToastService);
this.toastService.success('Venda criada com sucesso.');
this.toastService.error(extractApiErrorMessage(error, 'Não foi possível salvar.'));
```

- `success` / `error` / `warning` / `info`, all `(message, durationMs?)`.
  Per **Services** in `docs/CONVENTIONS.md`: only call this from the
  component orchestrating the action (a dialog's submit handler, a page's
  save handler) — never from inside a data service.

### Loading overlay (`loadingOverlay`)

Attribute directive — dims/inerts the host's existing content and overlays a
spinner, instead of swapping the DOM out from under it:

```html
<div [loadingOverlay]="store.loading()">
  <app-table [columns]="columns()" [data]="store.entities()" />
</div>
```

- `loadingOverlay` (boolean), `loadingOverlayLabel` (default `'Carregando'`),
  `loadingOverlayShowDelay` (debounced, default 200ms — avoids a flash on
  fast loads).

## Layout & data

### Table (`app-table`)

Built on CDK Table (`CdkTable`), driven entirely by a `ColDef[]` — no
per-column template boilerplate for the common cases.

```ts
protected readonly columns = computed<ColDef<Sale>[]>(() => [
  { key: 'customerName', title: 'Cliente' },
  { key: 'totalAmount', title: 'Total', type: 'currency' },
  { key: 'createdAt', title: 'Data', type: 'date', format: 'dd/MM/yyyy HH:mm' },
  { key: 'id', title: 'Ações', type: 'template', template: this.actionsTemplate },
]);
```
```html
<app-table [columns]="columns()" [data]="store.entities()" [trackBy]="trackBy" [loadingOverlay]="store.loading()" />
```

- `ColDef` (`components/table/model/col-def.ts`) `type`: default (plain
  text), `'date'` (+ `format`), `'number'` (+ `digitsInfo`), `'currency'` (+
  `currency`), or `'template'` (+ a `Signal<TemplateRef<TableEvent>>` from
  `viewChild.required` — the standard way to render row actions).
- `trackBy` (required), `(cellClick)` emits `{ row, column }`.

### Paginator (`app-paginator`)

```html
<app-paginator mode="compact" [page]="store.page()" (pageChange)="goToPage($event)" [pageSize]="pageSize" [length]="store.total()" [showPageSizeSelector]="false" [disabled]="store.loading()" />
```

- `mode`: `'compact'` (prev/next + range label, used alongside a fixed
  `PAGE_SIZE` constant in most list stores) or `'full'` (page numbers +
  page-size selector).
- `page`/`pageSize` are `model()`s (two-way), `length` required.

### Stepper (`app-stepper`)

Header-only stepper (numbered circles + connecting lines) for a routed
multi-step flow — each step is its own route/page behind a
`<router-outlet>`, not content projected into the stepper. See
`appointment-booking.component.html` for the reference usage: drive
`[selectedIndex]` from the active route, react to `(headerClick)` to
navigate.

### Tabs (`app-tabs`)

Header-only nav bar for freely-selectable, **routed** tab content — each tab
is its own child route, rendered through a `<router-outlet>` below the bar
(as opposed to **Stepper** above, which is a sequential wizard header, or a
content-projection panel switcher — this repo's tabs always map to routes,
not client-side-only visibility toggling).

```ts
protected readonly tabs = computed<TabItem[]>(() => [
  { label: 'Info', link: 'info' },
  { label: 'Telefones', link: 'phones' },
  ...(canViewSales() ? [{ label: 'Vendas recentes', link: 'sales' }] : []),
]);
```
```html
<app-tabs [tabs]="tabs()" label="Seções do cliente" />
<router-outlet />
```

- `TabItem` (`components/tabs/tab-item.model.ts`): `label`, `link` (passed to
  `[routerLink]`), `disabled?`.
- `app-tabs`: `tabs` (required `TabItem[]`), `label` (aria-label for the
  tablist). Active state comes from `routerLinkActive`/route matching, not
  internal component state — see `customer-details.component.ts` +
  `customer.routes.ts` (`children:` under the `:customerId` route) for the
  reference usage, including a component-scoped store
  (`CustomerDetailsStore`) shared between the shell and each routed tab so
  they don't each refetch the parent entity.
- Tabs list can be built conditionally (spread a permission-gated array
  entry in, as above) — each tab's own route should carry the matching
  `canActivate` guard too, since the tab bar hiding a link doesn't stop
  direct navigation to its route.
- The active-tab classes are set via `routerLinkActive="..."` (a plain
  space-separated string), not a `[class]="{...}"` object bound to
  `rla.isActive`. Native Angular `[class]` object bindings do **not** split
  space-separated object keys into multiple classes the way `NgClass` does —
  a key like `'border-primary-500 text-primary-700': someCondition` is
  silently never applied (no error, the DOM just never gets those classes).
  `routerLinkActive`'s own string input splits on spaces correctly and
  applies classes imperatively via `Renderer2`, independent of the host
  component's change-detection timing — keep using it for any route-active
  styling rather than reintroducing a `[class]` object keyed off
  `rla.isActive`.

### Confirm dialog (`ConfirmDialogComponent`)

Not used directly in a template — open it via `DialogService`:

```ts
const dialogRef = this.dialogService.open<boolean, ConfirmDialogData>(ConfirmDialogComponent, {
  data: { title: 'Excluir venda', message: `Tem certeza...?`, confirmLabel: 'Excluir', danger: true },
  size: 'md',
  role: 'alertdialog',
  ariaModal: true,
  ariaLabelledBy: 'confirm-dialog-title',
});
dialogRef.closed.subscribe((confirmed) => { if (confirmed) { /* ... */ } });
```

- `ConfirmDialogData`: `title`, `message`, `confirmLabel?`, `cancelLabel?`,
  `danger?` (styles the confirm button as destructive). Resolves the dialog's
  `closed` with a plain `boolean`.

## Other

### Preload (`appPreloadLoader`)

Warms a lazy-loaded chunk (a dialog opened via `DialogService`'s lazy
overload, a routed component) ahead of the action that needs it:

```html
<button btn btnPrimary [appPreloadLoader]="customerFormDialogLoader" (click)="openCreateDialog()">Novo cliente</button>
```

- `appPreloadLoader` (required) — the same `() => Promise<Component>` loader
  you pass to `DialogService.open`/`loadComponent`.
- `appPreloadOn`: `'hover'` (default; also triggers on focus for keyboard
  users), `'viewport'`, or `'idle'`.
