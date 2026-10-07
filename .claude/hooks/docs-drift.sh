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

declare -A touched_docs
declare -A code_by_doc

while IFS= read -r f; do
  [ -z "$f" ] && continue
  if echo "$f" | grep -Eq "$ignore_regex"; then
    continue
  fi
  doc=$(module_doc "$f")
  [ -z "$doc" ] && continue
  if [ "$f" = "$doc" ]; then
    touched_docs["$doc"]=1
    continue
  fi
  code_by_doc["$doc"]="${code_by_doc[$doc]:-}${code_by_doc[$doc]:+, }$f"
done <<< "$changed"

missing=()
for doc in "${!code_by_doc[@]}"; do
  if [ ! -f "$doc" ]; then
    missing+=("$doc missing - new/undocumented module touched by: ${code_by_doc[$doc]}")
  elif [ -z "${touched_docs[$doc]:-}" ]; then
    missing+=("$doc not updated - module code changed: ${code_by_doc[$doc]}")
  fi
done

if [ ${#missing[@]} -gt 0 ]; then
  printf '%s\n' "${missing[@]}" >&2
  exit 2
fi

exit 0
