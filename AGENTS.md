# I’MON Website — Engineering Rules

This repository is the owned, standalone replacement for the purchased I’MON website template.

## Primary invariant: pixel and interaction parity, not redesign

The source published site is the ground truth: `https://fantastic-future-931954.framer.app/`.
Do not reinvent the layout, add decorative gradients, replace arrows with random glyphs, use stock photos, reorder sections, or change the creative direction. Correct the existing site while keeping the distinctive layout.

Before changing a visual section:
1. Inspect the exact corresponding source page at 1440px and 390px, preferably also 768px.
2. Capture font sizes, line heights, rects, crop, section start/end, link/arrow geometry and motion.
3. Make the smallest CSS/component change, preserve responsive semantics and CMS bindings.
4. Inspect the result at the same viewport and scroll position; do not claim parity based on one viewport or one screenshot.

Source-template fake company names, biographies, social links and legal content are **not** I’MON facts. Never present them as real. Correct/approved content can be different, but the editorial composition should remain as close as possible.

## Code, CMS and editor

* Next.js SSR is the public renderer; Payload CMS is the content/data source.
* I’MON Studio is an interface on the **same** renderer and CMS, not a second inconsistent renderer.
* Do not hard-code CMS text, media, order and component data in React after it has been migrated to Payload.
* Autosave changes a **draft** only. Explicit publish updates public output. Maintain revision checks, role checks, ownership and CSRF / origin guards.
* Changes to collection schema require a proper tracked migration. No automatic schema `push` and no direct production SQLite mutation.
* Do not import AGPL sources (e.g. Revyme) into proprietary code without resolving the licensing/disclosure and NOTICE obligations.
* Prefer permissively licensed libraries if extending Studio. MIT/BSD/Apache licenses still require their relevant notices.

## Motion and visuals

* Avoid generic AI-slope motion. Match the actual source behavior (timing, scroll trigger, stagger, easing, media cropping).
* Respect `prefers-reduced-motion`; avoid hijacking text input or scroll focus in the editor.
* Use `src/components/ArrowIcon.tsx` for editorial arrow icons. Do not invent new arrow variants or use arbitrary Unicode arrows in public JSX.
* Image assets belong to the owned repository or the CMS media directory; do not substitute unrelated third-party stock.

## Tests and safety

* Work on a dedicated feature branch and isolated worktree/SQLite, not on production.
* Local smoke: `pnpm check`, `pnpm test:studio`, `pnpm build`.
* Browser: test public routes and Studio draft->publish flow, drag-drop, forms and responsiveness.
* Match original font-size/H1 positions before declaring fidelity; full-page scroll length is also a useful discrepancy signal but not sufficient alone.
* Keep credentials, `.env`, SQLite, uploads, backups and browser profiles out of Git. Do not print credentials.
* Do not run heavy parallel browsers/servers longer than necessary on the user's Mac; clean up only research processes you started.

## Further context

See `docs/FRAMER-REBUILD-RESEARCH.md` and `docs/FULL-REFACTOR-AUDIT.md` for candidate repositories, limitations and measured visual discrepancies.
