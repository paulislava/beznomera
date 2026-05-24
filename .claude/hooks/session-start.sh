#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo '{"async": true, "asyncTimeout": 300000}'

cd "$CLAUDE_PROJECT_DIR"

echo "[session-start] Installing root dependencies..."
npm install --legacy-peer-deps --prefer-offline 2>&1

echo "[session-start] Installing shared dependencies..."
cd packages/shared
npm install --legacy-peer-deps --prefer-offline 2>&1

echo "[session-start] Building shared..."
npm run build 2>&1

echo "[session-start] Installing backend dependencies..."
cd ../backend
npm install --legacy-peer-deps --prefer-offline 2>&1

echo "[session-start] Installing web dependencies..."
cd ../web
npm install --legacy-peer-deps --prefer-offline 2>&1

echo "[session-start] Done."
