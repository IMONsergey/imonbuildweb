# I’MON Studio — implementation checkpoint

Working branch: `feat/studio-visual-editor-20261020`, isolated worktree `imonbuildweb-studio`.
The original `imonbuildweb` worktree, its main branch and its database are not modified by Studio development.

## Architecture

`/studio` is the primary visual editor. `/admin?technical=1` retains Payload's technical UI. Canvas and public pages share the same React renderers. No second screenshot-only renderer is used. The editor currently supports component/section composition, structured content, nested field selection, per-breakpoint property overrides, media, draft save, explicit document publication, revisions, undo/redo and section ordering.

All mutations use the authenticated user's Payload access rules. Draft writes explicitly use both `draft: true` and `_status: draft`. Publication is a separate operation. Studio saves use a transaction and a document revision check. Editor endpoints are same-origin and private/no-store.

## Database

Never enable automatic schema `push` while multiple app bundles can use the database. It caused concurrent schema updates in the earlier pass. All schema changes have checked-in migrations. The isolated development copy was backed up and reconciled against those migrations without dropping content. New deployments run the normal Payload migrations on a fresh or properly migrated database.

`prepare-studio-content.ts` and `refresh-source-cases.ts` default to drafts. Their `--publish-local-preview` flag is restricted to the isolated worktree. They were applied only to this local preview database. Passwords, auth cookies, SQLite files, uploads and backups must never be committed.

## Checks recorded at this checkpoint

- Production compilation and TypeScript succeeded before the final small interaction fixes.
- The editor rendered the real homepage; screenshot smoke found 23 documents and no browser or HTTP errors.
- 69 public-page/viewport checks (23 routes × 1440/768/390): all HTTP 200, no browser exceptions, no broken loaded images. Two legal-page mobile heading overflows were identified and fixed afterward. An offscreen accessible heading was a false positive and excluded from the scanner.
- The API workflow passed authentication, listing, media, draft creation/save, stale revision conflict, unsafe-link rejection, explicit publication, continued draft isolation, standard Payload draft isolation and draft-only version restoration.
- The long UI workflow needs a final production rerun. A cold development bundle exceeded its iframe test timeout; this is not evidence of a passing workflow.

## Known scope limits

This is a component-based visual editor, not a complete reproduction of Framer's freeform layout engine. Arbitrary vector drawing, reusable component variants, collaborative cursors, custom interaction timelines and unrestricted reparenting are not implemented. Rich text formatting and system-wide access/settings still open the technical CMS. Do not describe any of those capabilities as finished.

Source-template articles, portraits, showcase cases, legal placeholders and contact details still need editorial/legal approval before a public launch. Email/CRM delivery is not configured; the contact form stores leads in the database.

## Контрольное обновление от 20 октября

- API + Chrome workflow проверяет непосредственные изменения макета, сетки, текстов, анимации, порядок слоёв, публикацию и изоляцию черновиков. Тестовый браузер не должен подменять `Origin` и `Sec-Fetch-Site` глобально — это ломало загрузку ресурсов. API GET указывает Origin явно.
- 23 страницы × 1440/768/390 = 69 маршрутов без HTTP/JS/геометрических ошибок. Проверка не является заявлением о точной анимационной идентичности.
- Для Askona селекторы по именам медиа удалены. Композиция хранится как `visual.display` с вариантами `overlapRight`, `overlapLeft`, `portraitOffset`.
- Все изменения остаются в изолированном worktree и его отдельной базе, основная ветка не затрагивается.
