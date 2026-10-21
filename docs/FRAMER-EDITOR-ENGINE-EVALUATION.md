# I’MON — Framer-like editor research and fidelity gate (2026-10-21)

## Goal and non-negotiable constraint

The published site is the source of truth for visual fidelity: https://fantastic-future-931954.framer.app/. Do not redesign typography, layout, imagery, motion, arrows, or component styling in order to fit an editor. Any editor must preserve the actual Next.js React renderers and connect to the existing Payload content. The 23 live pages, projects, articles, forms and navigation must remain intact.

## Candidate repository research

Research copies (not mixed into application source):
`/Users/erdc/Projects/imon-builder-research/revyme`,
`/Users/erdc/Projects/imon-builder-research/openpage`,
`/Users/erdc/Projects/imon-builder-research/instatic`.

| Candidate | License | Core architecture | Fit for I’MON |
|---|---|---|---|
| [Revyme](https://github.com/revyme-web/builder) | AGPL-3.0-only + notice-preservation; commercial alternative available | Vite-based JSX source editor; parses TSX, re-emits Next.js code; sandbox iframe; 3 development servers; advanced drag/responsive/motion/CMS | Closest to the requested Framer experience, but not a drop-in CMS UI for Next.js+Payload; source-code mutation and AGPL obligations require deliberate fork/integration |
| [OpenPage](https://github.com/buildingopen/openpage) | MIT | React 19 / Vite / Zustand / typed JSON blocks | Easiest to adapt into existing Payload data schema; simpler block-based UI rather than pixel-perfect canvas |
| [Instatic](https://github.com/anothernocoder/instatic) | MIT | Bun / backend + visual CMS + static HTML publishing | Complete alternative stack, but switching would replace the Next.js application and compromise existing animations/integrations |
| [Onlook](https://github.com/onlook-dev/onlook) | Apache 2.0 (verify files/versions before integration) | Visual code editor for React | Closest to editing the existing React code directly; not a drop-in CMS implementation |
| [Webstudio](https://github.com/webstudio-is/webstudio) | AGPL-3.0-or-later; some animation extensions proprietary | Standalone visual builder with headless CMS bindings | Powerful CSS inspector, but separate runtime and difficult self-hosted builder deployment |

**Tested Revyme** in isolation on Mac: commit `e850b5b` (2026-10-19), `npm ci` and `npm run build` succeeded; all three Vite development endpoints (3333, 5174, 5175) ran and the welcome editor rendered. Build reported direct `eval` in a code-runtime path and chunk-size warnings. Do not treat this as proof that existing Payload content or purchased template can be imported 1:1. Do not embed its code in the proprietary I’MON repo without reviewing/completing AGPL or commercial licensing requirements.

**Recommendation:** use Revyme as the visual interaction feature benchmark and a separately licensed candidate. Preserve I’MON Studio and Payload as the verified production-oriented content architecture until a sandbox integration proves the JSX/CMS two-way binding and licensing are resolved. Do not replace the live site's renderer with Revyme's exporter merely to obtain a pretty UI.

## Objective visual discrepancies (saved automated browser capture)

Source: `/Users/erdc/Projects/imon-builder-research/visual/reference-metrics.json` plus screenshots of each route at 1440 and 390. Measurements are from the versions captured before the 2026-10-21 fixes:

| Route | Viewport | Source scroll height | Rebuilt scroll height | Delta |
|---|---|---:|---:|---:|
| Home | desktop 1440 | 9,212 | 9,213 | +1 |
| Home | phone 390 | 9,847 | 8,681 | −1,166 |
| Work | desktop 1440 | 3,291 | 3,824 | +533 |
| Work | phone 390 | 3,017 | 3,726 | +709 |
| About | desktop 1440 | 8,184 | 8,867 | +683 |
| About | phone 390 | 9,222 | 6,862 | −2,360 |
| Contact | desktop 1440 | 2,694 | 2,696 | +2 |
| Contact | phone 390 | 2,146 | 1,797 | −349 |
| GAC M8 | desktop 1440 | 31,814 | 32,206 | +392 |
| GAC M8 | phone 390 | 22,472 | 18,323 | −4,149 |
| Askona | desktop 1440 | 13,153 | 15,641 | +2,488 |
| Askona | phone 390 | 8,362 | 9,238 | +876 |

Source Work/Contact/About mobile H1 ≈ 56px; rebuilt ≈ 80px. The source uses a different title rendering in the Askona case: it cannot be assessed solely with a matching H1 selector. Generic glyph `↗` appeared throughout the rebuild while the original uses its own fine arrow geometry.

## Implemented first parity fixes

- Replaced Unicode `↗` in site components with one consistent, centered, 24×24 SVG arrow component; kept all links and interactions.
- Adjusted Work, About, News, Contact mobile hero heading sizing toward the measured 56px reference at 390px without changing desktop rules.
- Repaired semantic spaces between homepage title spans while preserving their block layout.
- The previous refactor already moved case media overlap variants to CMS data, away from filename-specific CSS.

## Acceptance gate before editor engine replacement

1. Compare source and rebuild at 1440/768/390 **at top, 25%, 50%, 75%, bottom scroll**, not only HTTP status.
2. Match typography (family, optical metrics, size, tracking, line breaks), 12-column geometry, image crop, stage-specific animations, hover effects, and all arrow icons.
3. Demonstrate no-code edit from the editor that survives refresh and publishes **without changing surrounding design**: text; media; add/duplicate/reorder a block; mobile override; article; project; menu; GSAP timeline.
4. Preserve source accessibility and animations under reduced-motion preferences.
5. Protect unpublished drafts, forms, media, role permissions, and back up before any migration.
6. Compare staging with the original before touching `main`; user must approve final visual parity.

**Not yet delivered:** 1:1 full-site fidelity, frame-accurate animation parity, visual timeline editor, full Framer-equivalent component/CMS schema editor, and a licensed Revyme integration. No claim to the contrary should be made.

## Additional source-preservation trials (2026-10-21)

**Framecoded** ([endcycles/framer-copy](https://github.com/endcycles/framer-copy), MIT) claims conversion from published sites to framework-native Next.js/React with responsive capture and supported Motion transitions. A tested local export in `imon-builder-research/framecoded-export-probe` compiled and typechecked, but generated just **two routes**, Home and About, from this **23-route** site. It also retains framework-related CSS variables and is not an admin/CMS system. This is unsuitable as a drop-in replacement.

**framer-exporter** ([osisdie/framer-exporter](https://github.com/osisdie/framer-exporter), MIT) independently crawled 21 linked routes and captured 379 assets. The fast research export deliberately skipped supplementary asset fetches, so it is **not a fully offline image baseline**. At desktop, the captured HTML reproduces original scroll heights (Home 9,212px, Work 3,291px, About 8,184px) but throws a React hydration error (#405) and `Invalid base URL` in the exported runtime, making interactions unusable. The two sitemap-only cases were not discovered. Never ship this static export as the live site; it is for geometry and asset reference only.

**Full Site Export**, an independently published marketplace plugin, advertises pixel-exact static and Next.js exports but requires actual access to the source project. Verify licensing, functionality and whether the purchased template is editable before using it. It is not currently part of the worktree.

### Pixel-fidelity actions

- Source 390px Work title 56px vs previously 80px: adjusted to 56.16px and verified in Chrome.
- Source mobile About/Contact photos are stacked landscape rather than side-by-side/tall portrait: corrected mobile media layout.
- Mobile hero containers: Work 328px, About 309px, Contact 308px, with source-like 390px image starts.
- Cross-platform Unicode arrows replaced with a consistent SVG. No changes to links, actions or hover intent.
- Semantic spaces restored in the homepage title's three block spans.
- **Remaining mismatch**: full-page heights and lower sections differ substantially; pixel-perfect reproduction and animation equivalence are not claimed.

A two-way CMS editor and original motion cannot both be obtained merely by copying a static export: one must map each live React component and its editable fields to CMS records, while retaining proper hydration, responsive rules, events and real original imagery.
