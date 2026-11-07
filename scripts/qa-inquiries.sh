#!/usr/bin/env bash
# Run from the repository root. Uses only a fresh, disposable SQLite database.
set -euo pipefail
qa_dir=$(mktemp -d "${TMPDIR:-/tmp}/imon-inquiries.XXXXXXXX")
trap 'rm -rf -- "$qa_dir"' EXIT
export DATABASE_URL="file:$qa_dir/inquiry-tests.db"
export PAYLOAD_SECRET=isolated-tests-only-000000000000000000000000000000000000
export NEXT_PUBLIC_SERVER_URL=http://localhost:3000
export IMON_ANALYTICS_ENABLED=false
export NODE_OPTIONS=--max-old-space-size=3072
PNPM=(corepack pnpm@10.33.1)
"${PNPM[@]}" exec payload migrate
"${PNPM[@]}" check
"${PNPM[@]}" exec vitest run --config vitest.config.mts tests/int/contact.int.spec.ts tests/int/contact-db.int.spec.ts tests/int/lead-form.int.spec.ts tests/int/analytics.int.spec.ts
"${PNPM[@]}" exec eslint src/lib/contact.ts src/lib/analytics.ts src/components/Analytics.tsx src/components/Interactive.tsx 'src/app/(frontend)/api/contact/route.ts' 'src/app/(frontend)/layout.tsx' src/collections/Leads.ts tests/int/contact.int.spec.ts tests/int/contact-db.int.spec.ts tests/int/lead-form.int.spec.ts tests/int/analytics.int.spec.ts
