#!/usr/bin/env bash
#
# Build script for Nostr Calendar Block WordPress plugin
# Creates a distributable ZIP file in dist/
#
# Usage:
#   ./build-plugin-zip.sh          # builds ZIP with version from plugin header
#   ./build-plugin-zip.sh 1.2.0    # builds ZIP with explicit version
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="${SCRIPT_DIR}/plugin/nostr-calendar-block"
DIST_DIR="${SCRIPT_DIR}/dist"
PLUGIN_SLUG="nostr-calendar-block"

# Determine version
if [ -n "${1:-}" ]; then
    VERSION="$1"
else
    VERSION=$(grep -m1 "Version:" "${PLUGIN_DIR}/${PLUGIN_SLUG}.php" | sed 's/.*Version:\s*//' | tr -d '[:space:]')
fi

if [ -z "$VERSION" ]; then
    echo "ERROR: Could not determine plugin version."
    exit 1
fi

ZIP_NAME="${PLUGIN_SLUG}-${VERSION}.zip"
ZIP_PATH="${DIST_DIR}/${ZIP_NAME}"
LATEST_LINK="${DIST_DIR}/${PLUGIN_SLUG}-latest.zip"

echo "=== Building ${PLUGIN_SLUG} v${VERSION} ==="

# Ensure dist directory exists
mkdir -p "${DIST_DIR}"

# Remove old ZIP if it exists
[ -f "${ZIP_PATH}" ] && rm "${ZIP_PATH}"

# Create ZIP from plugin directory, excluding dev/build files
cd "${SCRIPT_DIR}/plugin"
zip -r "${ZIP_PATH}" "${PLUGIN_SLUG}/" \
    -x "${PLUGIN_SLUG}/node_modules/*" \
    -x "${PLUGIN_SLUG}/.git/*" \
    -x "${PLUGIN_SLUG}/.gitignore" \
    -x "${PLUGIN_SLUG}/.editorconfig" \
    -x "${PLUGIN_SLUG}/.eslintrc*" \
    -x "${PLUGIN_SLUG}/.stylelintrc*" \
    -x "${PLUGIN_SLUG}/.prettierrc*" \
    -x "${PLUGIN_SLUG}/phpcs.xml*" \
    -x "${PLUGIN_SLUG}/composer.json" \
    -x "${PLUGIN_SLUG}/composer.lock" \
    -x "${PLUGIN_SLUG}/webpack.config.js" \
    -x "${PLUGIN_SLUG}/*.map" \
    -x "${PLUGIN_SLUG}/tests/*" \
    -x "${PLUGIN_SLUG}/.DS_Store" \
    -x "*/.DS_Store"

# Update latest symlink
cd "${DIST_DIR}"
ln -sf "${ZIP_NAME}" "${PLUGIN_SLUG}-latest.zip"

echo ""
echo "=== Build complete ==="
echo "  ZIP:    ${ZIP_PATH}"
echo "  Latest: ${LATEST_LINK} -> ${ZIP_NAME}"
echo "  Size:   $(du -h "${ZIP_PATH}" | cut -f1)"
