#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
DTS_FILE="$REPO_ROOT/node_modules/@lucide/angular/types/lucide-angular.d.ts"

if [ ! -f "$DTS_FILE" ]; then
  echo "Could not find $DTS_FILE — run pnpm install first." >&2
  exit 1
fi

QUERY="${1:-}"

ALL_ICONS=$(grep -oE "^export \{.*\}" "$DTS_FILE" \
  | tr ',' '\n' \
  | sed -E 's/^[[:space:]]*//; s/[[:space:]]*$//; s/^export \{ //; s/ \};?$//' \
  | grep -E '^Lucide[A-Z]' \
  | grep -vE '^(LucideIcon|LucideIconData|LucideIconNode|LucideIcons|LucideIconProps|LucideDynamicIcon|LucideAngularModule)$' \
  | sort -u)

if [ -z "$QUERY" ]; then
  echo "$ALL_ICONS"
else
  echo "$ALL_ICONS" | grep -i -- "$QUERY" || echo "No icons matching '$QUERY'."
fi
