#!/usr/bin/env bash
#
# setup.sh
#
# A script to set up a base Astro project with React, Tailwind, and ShadCN UI,
# using Bun where possible. It includes extra checks for non-empty directories
# and detecting an existing Astro setup. Adjust as needed!

# Exit immediately if any command fails
set -e

# ------------------------------------------------------------------------------
# 0. HELPER FUNCTION: CHECK IF DIRECTORY IS "EMPTY ENOUGH" FOR ASTRO
# ------------------------------------------------------------------------------
# We'll treat "empty enough" as: having 0 or minimal files, unless we intentionally
# want to wipe them. If it has a package.json or node_modules, create astro may fail.
is_directory_empty() {
  # If the directory has no files or only hidden ones, it’s “empty enough.”
  # "ls -A" lists all files including hidden, but excluding "." and "..".
  # if nothing found, it's empty
  if [ -z "$(ls -A "$1" 2>/dev/null)" ]; then
    return 0  # empty
  else
    return 1  # not empty
  fi
}

# ------------------------------------------------------------------------------
# 1. ASK ABOUT PROJECT NAME
# ------------------------------------------------------------------------------
read -p "Enter a folder name for your new Astro project (or press Enter to use current dir): " PROJECT_DIR
if [ -z "$PROJECT_DIR" ]; then
  PROJECT_DIR="."
fi

# Attempt creating the directory if needed
if [ "$PROJECT_DIR" != "." ]; then
  if [ -d "$PROJECT_DIR" ]; then
    echo "Directory '$PROJECT_DIR' already exists."
  else
    mkdir -p "$PROJECT_DIR"
    echo "Created directory '$PROJECT_DIR'."
  fi
fi

cd "$PROJECT_DIR" || {
  echo "ERROR: Failed to enter directory '$PROJECT_DIR'."
  exit 1
}

# ------------------------------------------------------------------------------
# 2. DETECT EXISTING ASTRO SETUP
# ------------------------------------------------------------------------------
# We'll do a naive check: if astro.config.* exists, we'll assume Astro is set up.
astro_config_found=false
if ls astro.config.* 1>/dev/null 2>/dev/null; then
  astro_config_found=true
fi

# ------------------------------------------------------------------------------
# 3. IF ASTRO IS NOT SET UP, DECIDE WHETHER TO CREATE ASTRO
# ------------------------------------------------------------------------------
if [ "$astro_config_found" = false ]; then
  # Not already set up. We can attempt create astro only if directory is empty, or user allows wiping.
  if ! is_directory_empty "."; then
    echo "NOTE: The current directory is not empty. create astro typically requires an empty folder."
    echo -n "Would you like to remove all files here before creating a new Astro project? (y/n): "
    read -r WIPE_ANSWER
    if [ "$WIPE_ANSWER" = "y" ]; then
      echo "Removing all existing files/folders in $(pwd)..."
      rm -rf ./* .[^.]*
    else
      echo "Skipping 'create astro' since the folder is not empty."
      echo "If you have an existing project or want to keep files, ensure Astro is installed manually."
      echo "Continuing to the next steps..."
      goto_install=false
    fi
  fi

  # Check again if it's empty now or if user accepted wiping
  if is_directory_empty "."; then
    echo "Creating a new Astro project (with React & Tailwind) via create astro..."
    echo "NOTE: If prompts appear, respond as needed (TypeScript selection, etc.)."
    if ! bun create astro@latest . --add react --add tailwind; then
      echo ""
      echo "ERROR: 'bun create astro@latest' command failed."
      echo "Possible reasons:"
      echo "  • Bun might not be installed or in PATH."
      echo "  • The 'create-astro@latest' package is unavailable or not found."
      echo "  • Network or permission errors."
      echo "Exiting."
      exit 1
    fi
  else
    echo "No changes: skipping create astro step."
  fi
else
  # Astro is already set up (astro.config.* found).
  echo "Astro config found. Skipping 'create astro' step."
fi

# ------------------------------------------------------------------------------
# 4. ENSURE DEPENDENCIES INSTALLED
# ------------------------------------------------------------------------------
# If the user skipped dependency installation in the wizard or if no wizard ran at all, do this:
echo "Running bun install to ensure dependencies are installed..."
bun install

# ------------------------------------------------------------------------------
# 5. CREATE BASIC src/pages/index.astro IF NONE EXISTS
# ------------------------------------------------------------------------------
if [ ! -f "src/pages/index.astro" ]; then
  echo "No src/pages/index.astro found. Creating a minimal index.astro..."
  mkdir -p src/pages
  cat <<EOF > src/pages/index.astro
---
import "@/styles/globals.css"
---
<h1>Hello from Astro!</h1>
<p>This is a basic page created by the setup script.</p>
EOF
fi

# ------------------------------------------------------------------------------
# 6. CREATE A GLOBALS.CSS (IF NEEDED)
# ------------------------------------------------------------------------------
if [ ! -d "src/styles" ]; then
  echo "src/styles directory not found. Creating src/styles..."
  mkdir -p src/styles
fi

if [ ! -f "src/styles/globals.css" ]; then
  echo "Creating a basic src/styles/globals.css with Tailwind directives..."
  cat <<EOF > src/styles/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF
fi

# ------------------------------------------------------------------------------
# 7. CONFIGURE TAILWIND BASE STYLES IN astro.config.mjs (IF PRESENT)
# ------------------------------------------------------------------------------
if ls astro.config.* 1>/dev/null 2>/dev/null; then
  # Use a simple approach: check if applyBaseStyles is missing
  if ! grep -q "applyBaseStyles" astro.config.* 2>/dev/null; then
    echo "Ensuring tailwind applyBaseStyles is disabled (prevent double styling)..."
    sed -i.bak 's|\(\s*tailwind(\)|\1{\n        applyBaseStyles: false,\n      }|g' astro.config.* || {
      echo "WARNING: Could not auto-insert applyBaseStyles. Edit your astro.config.* manually if needed."
    }
  fi
else
  echo "WARNING: No astro.config.* found. If you're using Tailwind, be sure to configure it manually."
fi

# ------------------------------------------------------------------------------
# 8. SHADCN INITIALIZATION (OPTIONAL)
# ------------------------------------------------------------------------------
echo -n "Do you want to initialize shadcn UI now? (y/n): "
read -r SHADCN_ANSWER
if [ "$SHADCN_ANSWER" = "y" ]; then
  if [ -f "components.json" ]; then
    echo "WARNING: A components.json file already exists. This may cause 'shadcn init' to fail or ask for removal."
  fi
  echo "Running 'bunx shadcn@latest init' to set up your shadcn UI..."
  if ! bunx shadcn@latest init; then
    echo "WARNING: 'shadcn init' failed or was aborted. You may manually run it later."
  fi
fi

# ------------------------------------------------------------------------------
# 9. SHADCN DEMO COMPONENT (OPTIONAL)
# ------------------------------------------------------------------------------
echo -n "Do you want to add a sample ShadCN component (e.g., Button)? (y/n): "
read -r SHADCN_COMPONENTS
if [ "$SHADCN_COMPONENTS" = "y" ]; then
  echo "Adding the Button component via shadcn add..."
  if ! bunx shadcn@latest add button; then
    echo "WARNING: 'shadcn add button' failed or was aborted."
  fi
fi

# ------------------------------------------------------------------------------
# 10. DONE!
# ------------------------------------------------------------------------------
echo ""
echo "-----------------------------------------------------------------"
echo "Setup script complete!"
echo "Next Steps:"
echo "1) cd \"$(pwd)\""
echo "2) Run 'bun dev' (or 'astro dev') to start local development."
echo "3) Explore src/ for your new Astro + React + Tailwind base."
echo "4) Optionally add more ShadCN components with 'bunx shadcn@latest add <component>'."
echo "-----------------------------------------------------------------" 