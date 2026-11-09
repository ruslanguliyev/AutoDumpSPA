# AvtoBaz — working rules

The design system lives in `design/`. Read `design/components.md` once per
session, and only the section of `design/pages.md` for the page you are
building. Screenshots are in `design/screenshots/`.

## Standing rules — apply without being told

- Tokens only. No hex, no raw Tailwind colour names. A missing colour is a
  missing token in `design/tokens.css`, not a literal.
- In dark theme `--primary` is a fill colour only. Links, prices and accent
  icons use `--primary-text`.
- 44px minimum on every interactive element, set explicitly. 48px inside the
  mobile filter drawer.
- Build on `shared/ui`. No page-local buttons, inputs, badges or cards.
- `PromotionBadge` is the only component that draws VIP/PREMIUM.
- Every string through i18next, az/ru/en. Plurals use the v4
  one/few/many/other forms — the old `_plural` keys are ignored by i18next 25.
- Prices go through the shared formatter: `189 900 AZN`, `—` when absent.
- Never invent a field. If the API does not return it, do not render a
  placeholder value for it — say so instead.
- Account actions (login, register, post, message, booking, payment) link to
  `https://app.avtobaz.example/...`. No backend work on this site.
- Migrate any SCSS the page still uses to Tailwind and delete the `.scss`.
  Never leave both.
- Both themes work on every screen. No component pins a theme.
- `overflow-wrap: anywhere` on card roots — long unbroken names overflow
  otherwise.
- No new dependency without asking.

## How to report

Five lines maximum unless I ask for more: what changed, what broke, what you
could not verify. No file-by-file narration, no tables unless I asked for
numbers.

## Verification

Do not start Docker or seed data unless I ask. Default check is build +
typecheck + lint. Browser walks happen once per batch of pages, not per page,
and only at 390px and 1280px in Russian unless I say otherwise.

## Known state

- Branch `redesign/design-system`, built in stages off `master`.
- Done: tokens + Inter + Bootstrap removed, `shared/ui`, Header/Footer/AdRails,
  the five entity cards.
- Ad rails render from 1584px, not 1440 — 1200 + 160 + 160 does not fit at 1440.
- The sellers directory hides private sellers (`useSellers.js`). Deliberate.
- The seed is thin: 2 parts, 2 services, 2 specialists, 3 sellers, no promo
  badges, no long names. Numbers measured against it prove little.
