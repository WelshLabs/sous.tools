#!/usr/bin/env bash
# fix-react-imports.sh
# Removes standalone `import React from "react";` lines from files using
# the new JSX transform (react-jsx) where React no longer needs to be in scope.

set -euo pipefail

FILES=(
  packages/domain-inventory/src/components/Supplier/SupplierHeader.tsx
  packages/domain-inventory/src/item-editor-form-fields.tsx
  packages/domain-signage/src/state-tab-bar.tsx
  packages/domain-signage/src/content-config-fields.tsx
  packages/domain-signage/src/pos-item-card.tsx
  packages/domain-signage/src/column-content-view.tsx
  packages/domain-signage/src/layout-builder.tsx
  packages/domain-signage/src/menu-item-selector.tsx
  packages/domain-signage/src/pair-display-dialog.tsx
  packages/domain-signage/src/atom-editor-popover.tsx
  packages/domain-signage/src/column-popover-editor.tsx
  packages/domain-signage/src/modifier-group-settings.tsx
  packages/domain-signage/src/modal-shell.tsx
  packages/domain-signage/src/css-helper.tsx
  packages/domain-signage/src/preview-column-layout.tsx
  packages/domain-signage/src/menu-item-styles-inspector.tsx
  packages/domain-signage/src/atom-editor-controls.tsx
  packages/domain-signage/src/slide-filmstrip.tsx
  packages/domain-signage/src/preview-media-carousel.tsx
  packages/domain-signage/src/layout-preview.tsx
  packages/domain-signage/src/block-editor-node.tsx
  packages/domain-signage/src/menu-list-modifier-settings.tsx
  packages/domain-signage/src/slide-renderer.tsx
  packages/domain-signage/src/block-children.tsx
  packages/domain-signage/src/display-picker.tsx
  packages/domain-signage/src/deck-card.tsx
  packages/domain-signage/src/slide-filmstrip-card.tsx
  packages/domain-signage/src/right-side-panel.tsx
  packages/domain-signage/src/typography-sample.tsx
  packages/domain-signage/src/stock-prompt-modal.tsx
  packages/domain-signage/src/preview-modifier-group.tsx
  packages/domain-signage/src/preview-block-renderer.tsx
  packages/domain-signage/src/device-settings-dialog.tsx
  packages/domain-signage/src/preview-content-blocks.tsx
  packages/domain-signage/src/canvas-column-count-bar.tsx
  packages/domain-signage/src/overlay-item.tsx
  packages/domain-signage/src/column-empty-view.tsx
)

for f in "${FILES[@]}"; do
  if [[ -f "$f" ]]; then
    # Remove line: import React from "react"; or import React from 'react';
    sed -i "/^import React from ['\"]react['\"];$/d" "$f"
    echo "✓ Fixed: $f"
  else
    echo "⚠ Not found: $f"
  fi
done

echo "Done."
