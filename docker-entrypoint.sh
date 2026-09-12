#!/bin/sh
# Runs the Development Scripts from the README on every container start,
# then starts the server in HTTP mode.
#
# Scripts run here: lint, pre-build (crawl -> update-version -> build-data ->
# lint:fix), build, dev. `dev:stdio` is intentionally skipped because the
# container runs in HTTP mode.
set -e

echo "==> [1/4] bun run lint"
bun run lint

echo "==> [2/4] bun run pre-build (crawl -> update-version -> build-data -> lint:fix)"
bun run pre-build

echo "==> [3/4] bun run build"
bun run build

echo "==> [4/4] bun run dev (HTTP mode, port ${PORT:-3000})"
exec bun run dev
