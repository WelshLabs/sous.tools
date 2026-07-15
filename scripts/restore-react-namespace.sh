#!/usr/bin/env bash
# restore-react-namespace.sh
# Adds back `import * as React from "react"` at the top of files that
# actually use the React namespace (React.FC, React.useState, React.Fragment, etc.)
# but had their import incorrectly removed.

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
    sed -i '1s/^/import * as React from "react";\n/' "$f"
    echo "✓ Restored React namespace in: $f"
  else
    echo "⚠ Not found: $f"
  fi
done

echo "Done."
