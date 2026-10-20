#!/usr/bin/env bash
# Gramscii landing — bounded macOS ARM64 CI lane.
# Executed by daniele21/local-runner-infra on an exact, trusted source SHA.
set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
  echo "::error::Node.js >=20 is required on the Mac runner" >&2
  exit 2
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "::error::npm is required on the Mac runner" >&2
  exit 2
fi

node -e 'const major = Number(process.versions.node.split(".")[0]); if (major < 20) { console.error("Node >=20 required"); process.exit(2) }'
echo "Landing CI: Node $(node --version), npm $(npm --version)"
echo "Source: ${SOURCE_REPO:-local} @ ${SOURCE_SHA:-working-tree}"

# This repository intentionally has zero npm runtime dependencies;
# do not run npm install, download browser binaries or alter the host.
npm test

# Verify that relative static assets required by the browser are present.
node --input-type=module <<'JS'
import fs from 'node:fs';
for (const path of [
  'index.html',
  'styles.css',
  'brand-dark.css',
  'motion.css',
  'storytelling.css',
  'src/app.js',
  'src/motion.js',
  'src/storytelling.js',
  'src/content.js',
  'favicon.svg',
]) {
  if (!fs.existsSync(path)) {
    console.error("Missing static asset:", path);
    process.exitCode = 1;
  }
}
JS
echo "Local Mac checks completed successfully."
