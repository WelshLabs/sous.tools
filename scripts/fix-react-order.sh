#!/usr/bin/env bash
# fix-react-order.sh
# Fixes files where `import * as React from "react"` was prepended before
# `"use client"`, violating the directive placement requirement.
# Correct order: "use client" first, then React import.

set -euo pipefail

FILES=(
  packages/domain-signage/src/block-children.tsx
  packages/domain-signage/src/block-editor-node.tsx
  packages/domain-signage/src/modifier-group-settings.tsx
  packages/domain-signage/src/preview-media-carousel.tsx
  packages/domain-signage/src/preview-modifier-group.tsx
  packages/domain-signage/src/right-side-panel.tsx
)

for f in "${FILES[@]}"; do
  if [[ -f "$f" ]]; then
    line1=$(sed -n '1p' "$f")
    line2=$(sed -n '2p' "$f")
    # Check if line1 is the React import and line2 is "use client"
    if [[ "$line1" == 'import * as React from "react";' && "$line2" == '"use client";' ]]; then
      # Swap: remove first 2 lines, prepend in correct order
      tail -n +3 "$f" > /tmp/react_fix_tmp.tsx
      printf '"use client";\nimport * as React from "react";\n' | cat - /tmp/react_fix_tmp.tsx > "$f"
      echo "✓ Fixed order in: $f"
    else
      echo "⚠ Unexpected format in: $f (line1='$line1', line2='$line2') — skipping"
    fi
  else
    echo "⚠ Not found: $f"
  fi
done

rm -f /tmp/react_fix_tmp.tsx
echo "Done."
