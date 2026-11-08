#!/bin/bash
# Stops the bridge and removes the lines it added to ~/.codex/config.toml.
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
LABEL="com.codex-claude-bridge"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
CODEX_CONFIG="$HOME/.codex/config.toml"
TAG="# codex-claude-bridge"

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
rm -f "$PLIST"
echo "==> service removed"

if [ -f "$CODEX_CONFIG" ] && grep -q "$TAG" "$CODEX_CONFIG"; then
  cp "$CODEX_CONFIG" "$CODEX_CONFIG.bak-ccb-uninstall-$(date +%Y%m%d-%H%M%S)"
  node "$DIR/scripts/configure-route.js" "$CODEX_CONFIG" "" remove
  echo "==> removed bridge lines from ~/.codex/config.toml"
fi
echo "==> Done. Restart the Codex app. (~/.codex-claude-bridge is left in place.)"
