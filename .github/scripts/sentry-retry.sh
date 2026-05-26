#!/usr/bin/env bash
#
# Run a sentry-cli command with bounded retries so a transient Sentry API
# error (e.g. HTTP 500) does not fail the release build on the first attempt.
#
# Used by .github/workflows/build-ios.yml and build-android.yml. The steps
# that call this set `continue-on-error: true`, so a sustained Sentry outage
# degrades gracefully (warning + missing source maps for that release) instead
# of blocking the build.
#
# Usage: bash .github/scripts/sentry-retry.sh <command> [args...]
# Override attempts with SENTRY_RETRY_MAX (default 3).
set -u

attempt=1
max="${SENTRY_RETRY_MAX:-3}"

until "$@"; do
  if [ "$attempt" -ge "$max" ]; then
    echo "::warning::Sentry command failed after ${max} attempts: $*"
    exit 1
  fi
  echo "Sentry attempt ${attempt} failed; retrying in $((attempt * 15))s..."
  sleep "$((attempt * 15))"
  attempt=$((attempt + 1))
done
