---
name: lucide-icons
description: Search the @lucide/angular icon names available in this project instead of grepping node_modules by hand. Use whenever picking an icon for app-icon, IconButtonComponent, ButtonComponent, or any [icon] input, or when unsure whether a specific Lucide icon name exists in the installed version.
---

# Lucide icon search

This project uses `@lucide/angular` for icons (`IconComponent`'s `[icon]` input,
`IconButtonComponent`'s `[icon]` input, etc.). Icon names change between
Lucide versions and guessing them wastes a build cycle. Use the bundled
script instead of grepping `node_modules` by hand.

## Usage

```bash
.claude/skills/lucide-icons/search-icons.sh <query>
```

- `<query>` is a case-insensitive substring match against the exported icon
  component names (e.g. `check`, `Trash`, `arrow-up` won't match — use plain
  substrings like `arrow` or `up`, not kebab-case).
- Omit `<query>` to print the full list of available icon names (~2000).
- Output names are exactly what to import from `@lucide/angular`, e.g.
  `LucideCircleCheck` → `import { LucideCircleCheck } from '@lucide/angular';`.

## Example

```bash
$ .claude/skills/lucide-icons/search-icons.sh triangle
LucideTriangle
LucideTriangleAlert
LucideTriangleDashed
LucideTriangleRight
```

The script reads directly from the installed package's type declarations
(`node_modules/@lucide/angular/types/lucide-angular.d.ts`), so it always
reflects the exact version pinned in this repo — no need to re-check this
file after a Lucide upgrade.
