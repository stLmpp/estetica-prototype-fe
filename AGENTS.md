You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

**Read `docs/CONVENTIONS.md` before writing or changing any code.** It has
the actual code-level rules this file used to inline — styling, TypeScript
style, Angular patterns, authorization, SSR, accessibility, state
management, templates, services. This file covers how an agent should
operate here (tooling); that one covers how the code itself is written.

## Tooling

- Use the available MCP servers instead of falling back to generic shell/CLI commands when an MCP tool covers the task (e.g. use the `angular-cli` MCP for Angular workspace discovery, best practices, generation, and running targets rather than invoking `ng`/`npm` directly via shell).
