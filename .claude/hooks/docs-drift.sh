#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

changed=$(printf '%s\n' "$(git diff --name-only HEAD)" "$(git ls-files --others --exclude-standard)" | sort -u)

ignore_regex='(^|/)(\.claude/|\.nuxt/|node_modules/|dist/|assets/|public/|scripts/)|(^|/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$|\.(spec|test)\.(js|ts)$|(^|/)__tests__/'

module_doc() {
  case "$1" in
    components/panel/*) echo "components/panel/CLAUDE.md" ;;
    components/*) echo "components/CLAUDE.md" ;;
    composables/*) echo "composables/CLAUDE.md" ;;
    stores/*) echo "stores/CLAUDE.md" ;;
    layouts/*) echo "layouts/CLAUDE.md" ;;
    middleware/*) echo "middleware/CLAUDE.md" ;;
    pages/panel.vue|pages/panel/*) echo "pages/panel/CLAUDE.md" ;;
    pages/*) echo "pages/CLAUDE.md" ;;
    plugins/*) echo "plugins/CLAUDE.md" ;;
    services/*) echo "services/api/CLAUDE.md" ;;
    utils/*|types/*) echo "utils/CLAUDE.md" ;;
    *) echo "" ;;
  esac
}

# Plain newline-separated lists instead of associative arrays: macOS ships bash 3.2, which has no `declare -A`.
touched_docs=""   # one doc path per line
code_pairs=""     # "doc<TAB>file" per line

while IFS= read -r f; do
  [ -z "$f" ] && continue
  if echo "$f" | grep -Eq "$ignore_regex"; then
    continue
  fi
  doc=$(module_doc "$f")
  [ -z "$doc" ] && continue
  if [ "$f" = "$doc" ]; then
    touched_docs="${touched_docs}${doc}"$'\n'
    continue
  fi
  code_pairs="${code_pairs}${doc}"$'\t'"${f}"$'\n'
done <<< "$changed"

missing=""
while IFS= read -r doc; do
  [ -z "$doc" ] && continue
  files=$(printf '%s' "$code_pairs" | awk -F'\t' -v d="$doc" '$1 == d { printf "%s%s", sep, $2; sep = ", " }')
  if [ ! -f "$doc" ]; then
    missing="${missing}${doc} missing - new/undocumented module touched by: ${files}"$'\n'
  elif ! printf '%s' "$touched_docs" | grep -Fxq "$doc"; then
    missing="${missing}${doc} not updated - module code changed: ${files}"$'\n'
  fi
done <<< "$(printf '%s' "$code_pairs" | cut -f1 | sort -u)"

if [ -n "$missing" ]; then
  printf '%s' "$missing" >&2
  exit 2
fi

exit 0
