#!/bin/bash

CURSOR_RULES_DIR=".cursor/rules"
SHARED_RULES_DIR=".cursor/shared/rules"

# Check if shared rules directory exists
if [ ! -d "$SHARED_RULES_DIR" ]; then
  echo "⚠️  Shared rules directory does not exist"
  echo "💡 Run: git submodule add git@github.com:tower1229/cursor-config.git .cursor/shared"
  exit 0
fi

# Create symbolic links
for rule in "$SHARED_RULES_DIR"/*.mdc; do
  if [ -f "$rule" ]; then
    rule_name=$(basename "$rule")
    link_path="$CURSOR_RULES_DIR/$rule_name"

    # Remove existing link if present
    if [ -L "$link_path" ]; then
      rm "$link_path"
    elif [ -f "$link_path" ]; then
      echo "⚠️  $rule_name exists as a regular file, skipping"
      continue
    fi

    # Create symbolic link
    ln -s "../shared/rules/$rule_name" "$link_path"
    echo "✅ Linked: $rule_name"
  fi
done

echo "✨ Done syncing cursor rules"

