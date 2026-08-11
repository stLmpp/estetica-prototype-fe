# Code Conventions & Project Structure

This document covers **where things live** and **what they're named**. For coding-style and
Angular/TypeScript best practices (signals, SSR, accessibility, etc.), see [AGENTS.md](../AGENTS.md).

## Folder Structure

```
src/app/
├── core/          Singleton, app-wide infrastructure
├── components/    Reusable, feature-agnostic design-system UI
├── routes/        Lazy-loaded feature routes
├── model/         Types shared across multiple features
├── shared/        Utility functions + generic reusable types
└── app.*          Bootstrap: root component, config, routes
```

### `core/`

App-wide singleton concerns — not reusable UI, not a specific feature. Each concern gets its
own subfolder, even if it currently holds a single file:

- `core/auth/` — session store, auth/organization services, better-auth provider, route guards
- `core/header/`, `core/sidebar/` — global chrome components
- `core/interceptors/` — HTTP interceptors

### `components/`

Reusable, feature-agnostic building blocks (buttons, inputs, table, dialog, etc.). Each
component/directive gets its own folder named after it. A component-owned contract type (e.g.
`ColDef`, `TableEvent`) stays **unsuffixed** and colocated with the component that owns it —
either as a sibling file or in that component's own `model/` subfolder (see
`components/table/model/`). These are implementation details of the component, not domain
concepts, so they don't get `.model.ts`.

### `routes/<feature>/`

Each feature route is self-contained: component(s), `.model.ts`, `.dto.ts`, `.service.ts`,
`.store.ts` all live together under `routes/<feature>/`. A child component only ever used by
one parent gets nested in its own subfolder (e.g. `catalog-item-form-dialog/` inside
`catalog-items/`, `sidebar-menu-item/` inside `sidebar/`). If a component is only ever used by
a single parent, nest it — don't leave it as a flat sibling.

### `model/`

Reserved for types that are genuinely **cross-feature** — no single route owns them (e.g.
`AuthRole`, `AuthOrgRole`). If a type belongs to one feature's data, it stays colocated under
that feature's `routes/<feature>/`, not here. Don't use `model/` as a default dumping ground.

### `shared/`

Utility functions (`safe.ts`, `http-params-from-object.ts`, pipes, operators) **and** generic
reusable types that aren't tied to one feature (e.g. `PaginationMetadata`, used by every
paginated list) — the type lives next to the utility code that deals with it, e.g.
`shared/pagination.model.ts`.

## File Naming Suffixes

| Suffix            | Used for                                                                                                      | Example                                          |
|-------------------|---------------------------------------------------------------------------------------------------------------|--------------------------------------------------|
| `.component.ts`   | Angular components                                                                                            | `catalog-items.component.ts`                     |
| `.directive.ts`   | Angular directives                                                                                            | `input.directive.ts`                             |
| `.service.ts`     | Injectable services (`@Service()`, `providedIn: 'root'`)                                                      | `catalog-item.service.ts`                        |
| `.store.ts`       | NgRx SignalStore feature stores                                                                               | `catalog-items.store.ts`                         |
| `.guards.ts`      | Route guard factories for a domain, grouped together                                                          | `auth.guards.ts`                                 |
| `.interceptor.ts` | A single HTTP interceptor factory                                                                             | `with-credentials.interceptor.ts`                |
| `.provider.ts`    | Provider factory functions                                                                                    | `better-auth.provider.ts`                        |
| `.pipe.ts`        | Pipes                                                                                                         | `string.pipe.ts`                                 |
| `.model.ts`       | Domain entities and data-shape contracts (feature entities *and* cross-cutting infra shapes like API errors)  | `catalog-item.model.ts`, `api-error.model.ts`    |
| `.dto.ts`         | Request/response payload shapes distinct from the entity (create/update payloads, filters, paginated results) | `catalog-item.dto.ts`                            |
| `.enum.ts`        | Const-object "enums" — always their own file, never inlined into a `.model.ts`/`.dto.ts`                      | `auth-role.enum.ts`, `catalog-item-type.enum.ts` |

Unsuffixed files are reserved for things that don't fit the categories above: component-owned
contract types (see `components/` section) and one-off utilities (`safe.ts`).

## Angular Functional Constructs

Guards, resolvers, and interceptors are always factory functions that return the typed Angular
function — see [AGENTS.md](../AGENTS.md#angular-best-practices) for the full rule and example.
