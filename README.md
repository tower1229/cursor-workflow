# AI Environment

Shared Cursor IDE configuration files for cross-project reuse.

## Contents

```
├── commands/           # Cursor custom commands
│   ├── create-prd.md      # PRD document generator
│   └── create-prompt.md   # Structured prompt generator
├── rules/              # Cursor rules (context files)
│   ├── daisyui.mdc                    # daisyUI 5 reference
│   ├── Development Specifications.mdc # Development standards
│   └── RIPERsigma-lite.mdc           # RIPER workflow framework
└── .gitignore
```

## Usage

### As Git Submodule (Recommended)

Add this repository as a submodule in your project's `.cursor` directory:

```bash
# Add submodule
git submodule add <repo-url> .cursor

# Initialize (for cloned projects)
git submodule update --init --recursive
```

### Update Configuration

```bash
# Pull latest changes
cd .cursor
git pull origin master
cd ..

# Or update all submodules
git submodule update --remote
```

### Remove Submodule

```bash
git submodule deinit -f .cursor
git rm -f .cursor
rm -rf .git/modules/.cursor
```

## Notes

- After adding as submodule, Cursor IDE will automatically recognize the `commands/` and `rules/` directories
- You can selectively enable/disable rules in Cursor settings
- Custom project-specific rules can coexist alongside these shared rules
