#!/usr/bin/env bash
# Builds one self-contained EF Core migrations bundle per module into ./bundles.
# The deploy pipeline runs each bundle as a one-off ECS task before the rolling deploy:
#
#   ./bundles/efbundle-support --connection "$ConnectionStrings__Aptiverse"
#
# then creates or updates the Wolverine tables with the API image itself:
#
#   dotnet host/Aptiverse.Host.dll resources setup
#
# Usage: scripts/migrations-bundle.sh [runtime-id]   (default: linux-arm64, matching Fargate Graviton)
set -euo pipefail

cd "$(dirname "$0")/.."

RUNTIME="${1:-linux-arm64}"
OUT_DIR="bundles"

# Add a module here when it gets its own DbContext.
MODULES=(Identity Support AiTutor Academics Practice)

dotnet tool restore >/dev/null
mkdir -p "${OUT_DIR}"

for module in "${MODULES[@]}"; do
  project="src/Modules/${module}/Aptiverse.${module}"
  lower="$(echo "${module}" | tr '[:upper:]' '[:lower:]')"
  echo "==> Bundling ${module} for ${RUNTIME}"
  dotnet ef migrations bundle \
    --project "${project}" \
    --startup-project "${project}" \
    --context "${module}DbContext" \
    --self-contained \
    --target-runtime "${RUNTIME}" \
    --output "${OUT_DIR}/efbundle-${lower}" \
    --force
done

echo "Bundles written to ${OUT_DIR}/"
