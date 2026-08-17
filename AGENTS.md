You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

**Read `docs/CONVENTIONS.md` before writing or changing any code.** It has
the actual code-level rules this file used to inline — styling, TypeScript
style, Angular patterns, authorization, SSR, accessibility, state
management, templates, services. This file covers how an agent should
operate here (tooling); that one covers how the code itself is written.

## Hard Rules

- **Do NOT add comments that just restate what the code already says.** If the identifier names and types already make it obvious, a comment adds nothing but noise. This is a hard rule — apply it to every edit, not just when reminded.
  - What NOT to do:
    ```ts
    /** ISO date string (`YYYY-MM-DD`); days before it render disabled. */
    readonly minDate = input<string | null>(null);
    ```
    `minDate` typed as `string | null` next to a `days` array already says everything that comment says.
  - Only comment when it explains a genuinely non-obvious **why** (a workaround, a constraint, a trade-off) that the reader can't get from the code itself — see the Code Comments section in `docs/CONVENTIONS.md` for the full rule.
- **When a `TODO.md` item is done, move it to `TODO_DONE.md` — do not delete it outright.** Same rule on the backend's `TODO.md`/`TODO_DONE.md`.

## Tooling

- Use the available MCP servers instead of falling back to generic shell/CLI commands when an MCP tool covers the task (e.g. use the `angular-cli` MCP for Angular workspace discovery, best practices, generation, and running targets rather than invoking `ng`/`npm` directly via shell).
