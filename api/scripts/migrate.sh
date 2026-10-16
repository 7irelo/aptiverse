#!/usr/bin/env bash
# Local dev: applies every module's EF Core migrations, then creates the Wolverine message tables.
# Deployed environments run the same `migrate` command as a one-off ECS task.
#
# Usage: scripts/migrate.sh
# Override the target with ConnectionStrings__Aptiverse; defaults to the local compose database.
set -euo pipefail

cd "$(dirname "$0")/.."

export ConnectionStrings__Aptiverse="${ConnectionStrings__Aptiverse:-Host=localhost;Port=5433;Database=aptiverse;Username=aptiverse;Password=aptiverse}"

dotnet run --project src/Aptiverse.Host --no-launch-profile -- migrate

echo "Done."
