# Cursor Workflow

Shared Cursor IDE configuration files for cross-project reuse.

## Contents

```
├── commands/           # Cursor custom commands
│   ├── create-prd.md      # PRD document generator
│   ├── create-prompt.md   # Structured prompt generator
│   ├── plan-dev.md        # Development planning
│   ├── research.md        # Research workflow
│   ├── review-prd.md      # PRD review
│   └── unit-test.md       # Unit testing
├── rules/              # Cursor rules (context files)
│   ├── daisyui.mdc                    # daisyUI 5 reference
│   ├── coding-standards.mdc           # Coding standards
│   └── RIPERsigma-lite.mdc           # RIPER workflow framework
├── scripts/            # Setup scripts
│   ├── sync-cursor-rules.ts  # TypeScript sync script (recommended)
│   └── sync-cursor-rules.sh  # Shell sync script (alternative)
└── .gitignore
```

## Recommended Setup: Git Submodule + Auto-Sync Script

This is the recommended approach for using cursor-workflow in your projects. It allows you to:

- Keep shared rules separate from project-specific rules
- Automatically sync rules via symbolic links
- Update shared rules across all projects easily
- Maintain version control for rule versions

### Step 1: Add as Git Submodule

Add this repository as a submodule in your project's `.cursor/shared` directory:

```bash
# Navigate to your project root
cd /path/to/your-project

# Add submodule
git submodule add git@github.com:tower1229/cursor-workflow.git .cursor/shared

# Initialize submodule (if needed)
git submodule update --init --recursive
```

**Note:** If you already have a `.cursor` directory with project-specific rules, this approach keeps them separate. The submodule will be in `.cursor/shared/`, and your project rules remain in `.cursor/rules/`.

### Step 2: Create Sync Script

Copy the sync script from this repository to your project:

```bash
# Copy TypeScript script (recommended)
cp .cursor/shared/scripts/sync-cursor-rules.ts scripts/

# Or copy shell script (alternative)
cp .cursor/shared/scripts/sync-cursor-rules.sh scripts/
chmod +x scripts/sync-cursor-rules.sh
```

**Or create manually:** Create `scripts/sync-cursor-rules.ts`:

```typescript
import {
  existsSync,
  readdirSync,
  lstatSync,
  symlinkSync,
  unlinkSync,
} from "fs";
import { join, relative, resolve } from "path";

const CURSOR_RULES_DIR = resolve(".cursor/rules");
const SHARED_RULES_DIR = resolve(".cursor/shared/rules");

function syncCursorRules() {
  // 确保 .cursor/rules 目录存在
  if (!existsSync(CURSOR_RULES_DIR)) {
    console.error(`❌ Directory ${CURSOR_RULES_DIR} does not exist`);
    process.exit(1);
  }

  // 检查共享规则目录是否存在
  if (!existsSync(SHARED_RULES_DIR)) {
    console.warn(
      `⚠️  Shared rules directory ${SHARED_RULES_DIR} does not exist`
    );
    console.log(
      "💡 Run: git submodule add git@github.com:tower1229/cursor-workflow.git .cursor/shared"
    );
    return;
  }

  // 读取共享规则目录中的所有 .mdc 文件
  const sharedRules = readdirSync(SHARED_RULES_DIR).filter((file) =>
    file.endsWith(".mdc")
  );

  if (sharedRules.length === 0) {
    console.log("ℹ️  No shared rules found");
    return;
  }

  let linked = 0;
  let skipped = 0;

  for (const rule of sharedRules) {
    const sharedPath = join(SHARED_RULES_DIR, rule);
    const linkPath = join(CURSOR_RULES_DIR, rule);

    // 如果链接已存在，先删除
    if (existsSync(linkPath)) {
      try {
        const stats = lstatSync(linkPath);
        if (stats.isSymbolicLink()) {
          unlinkSync(linkPath);
        } else {
          console.warn(`⚠️  ${rule} exists as a regular file, skipping`);
          skipped++;
          continue;
        }
      } catch (error) {
        console.warn(`⚠️  Error checking ${rule}:`, error);
        skipped++;
        continue;
      }
    }

    // 创建符号链接（使用相对路径）
    const relativePath = relative(CURSOR_RULES_DIR, sharedPath);
    try {
      symlinkSync(relativePath, linkPath);
      console.log(`✅ Linked: ${rule}`);
      linked++;
    } catch (error) {
      console.error(`❌ Failed to link ${rule}:`, error);
    }
  }

  console.log(`\n📊 Summary: ${linked} linked, ${skipped} skipped`);
}

syncCursorRules();
```

### Step 3: Configure package.json

Add the sync script to your `package.json`:

```json
{
  "scripts": {
    "cursor:sync-rules": "npx tsx scripts/sync-cursor-rules.ts",
    "postinstall": "yarn cursor:sync-rules"
  }
}
```

**Note:**

- If you use `npm`, replace `yarn` with `npm run`
- If you don't use TypeScript, you can use a shell script instead (see Alternative: Shell Script below)
- The `postinstall` hook ensures rules are synced automatically after `yarn install`

### Step 4: Run Initial Sync

Run the sync script to create symbolic links:

```bash
yarn cursor:sync-rules
# or
npm run cursor:sync-rules
```

You should see output like:

```
✅ Linked: daisyui.mdc
✅ Linked: coding-standards.mdc
✅ Linked: RIPERsigma-lite.mdc

📊 Summary: 3 linked, 0 skipped
```

### Step 5: Verify Setup

Check that symbolic links were created:

```bash
ls -la .cursor/rules/
```

You should see entries like:

```
lrwxr-xr-x  ... daisyui.mdc -> ../shared/rules/daisyui.mdc
lrwxr-xr-x  ... coding-standards.mdc -> ../shared/rules/coding-standards.mdc
lrwxr-xr-x  ... RIPERsigma-lite.mdc -> ../shared/rules/RIPERsigma-lite.mdc
```

## Usage

### Manual Sync

Run the sync script manually whenever needed:

```bash
yarn cursor:sync-rules
```

### Automatic Sync

Rules are automatically synced when you run:

```bash
yarn install
```

This happens because of the `postinstall` hook in `package.json`.

### Update Shared Rules

To update shared rules to the latest version:

```bash
# Option 1: Update submodule to latest
cd .cursor/shared
git pull origin master
cd ../..
yarn cursor:sync-rules

# Option 2: Update all submodules
git submodule update --remote
yarn cursor:sync-rules
```

### Clone Project with Submodule

When cloning a project that uses this setup:

```bash
# Clone with submodules
git clone --recurse-submodules <your-repo-url>

# Or if already cloned
git submodule update --init --recursive
yarn install  # Automatically syncs rules
```

## Alternative: Shell Script

If you prefer a shell script instead of TypeScript, create `scripts/sync-cursor-rules.sh`:

```bash
#!/bin/bash

CURSOR_RULES_DIR=".cursor/rules"
SHARED_RULES_DIR=".cursor/shared/rules"

# Check if shared rules directory exists
if [ ! -d "$SHARED_RULES_DIR" ]; then
  echo "⚠️  Shared rules directory does not exist"
  echo "💡 Run: git submodule add git@github.com:tower1229/cursor-workflow.git .cursor/shared"
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
```

Make it executable:

```bash
chmod +x scripts/sync-cursor-rules.sh
```

Update `package.json`:

```json
{
  "scripts": {
    "cursor:sync-rules": "bash scripts/sync-cursor-rules.sh"
  }
}
```

## Directory Structure

After setup, your project structure will look like:

```
your-project/
├── .cursor/
│   ├── rules/                    # Project-specific rules + symlinks to shared rules
│   │   ├── your-custom-rule.mdc  # Your project-specific rules
│   │   ├── daisyui.mdc -> ../shared/rules/daisyui.mdc
│   │   └── ...
│   ├── commands/                 # Your project-specific commands
│   └── shared/                   # Git submodule (cursor-workflow)
│       ├── rules/
│       │   ├── daisyui.mdc
│       │   ├── coding-standards.mdc
│       │   └── RIPERsigma-lite.mdc
│       └── commands/
├── scripts/
│   └── sync-cursor-rules.ts     # Sync script
└── package.json
```

## Benefits

1. **Separation of Concerns**: Shared rules stay in submodule, project rules stay in project
2. **Version Control**: Lock shared rules to specific versions via submodule commits
3. **Easy Updates**: Update all projects by updating submodule and running sync
4. **Automatic Sync**: Rules sync automatically after `yarn install`
5. **No Conflicts**: Project-specific rules won't conflict with shared rules

## Troubleshooting

### Symbolic links not working on Windows

If you're on Windows and symbolic links don't work, you may need to:

1. Run Git Bash or WSL as Administrator
2. Enable Developer Mode in Windows Settings
3. Or use the copy method instead (see below)

### Alternative: Copy Instead of Link

If symbolic links don't work for you, modify the sync script to copy files instead:

```typescript
import { copyFileSync } from "fs";
// ... replace symlinkSync with copyFileSync
copyFileSync(sharedPath, linkPath);
```

**Note:** With copying, you'll need to re-run sync after updating shared rules.

### Submodule not initialized

If you see errors about missing submodule:

```bash
git submodule update --init --recursive
```

### Rules not appearing in Cursor

1. Make sure symbolic links are created: `ls -la .cursor/rules/`
2. Restart Cursor IDE
3. Check Cursor settings to ensure rules are enabled

## Remove Submodule

To remove the submodule:

```bash
git submodule deinit -f .cursor/shared
git rm -f .cursor/shared
rm -rf .git/modules/.cursor/shared

# Remove symbolic links
yarn cursor:sync-rules  # Will clean up broken links
# Or manually remove links from .cursor/rules/
```

## Notes

- Cursor IDE automatically recognizes rules in `.cursor/rules/` directory
- You can selectively enable/disable rules in Cursor settings
- Custom project-specific rules can coexist alongside shared rules
- Symbolic links ensure shared rules are always up-to-date
- The sync script is idempotent - safe to run multiple times
