# Handoff to Claude Code

## Before you start

1. Copy this whole `design/` folder into the repo root and commit it.
2. Screenshot each artboard from the design canvas and save them as
   `design/screenshots/<page>.png` (`home.png`, `cars.png`, `car-detail.png`,
   `part-detail.png`, `service.png`, `specialist.png`, `seller.png`,
   `promote.png`, `mobile-home.png`, `mobile-cars.png`, `mobile-filters.png`,
   `mobile-car.png`, `home-light.png`). For UI work the images matter more than
   any prose — Claude Code reads them.
3. Create a branch: `git checkout -b redesign/design-system`.

Work **in stages**. Do not paste the whole thing as one prompt — a 15-page
rewrite in one go produces a diff nobody can review.

---

## Stage 0 — groundwork (one prompt)

```
Read design/tokens.css, design/components.md and design/pages.md, plus the
screenshots in design/screenshots/. They define the new AutoBaz design system.

Do only this stage, then stop and report:

1. Replace the colour block in src/app/index.css with design/tokens.css,
   keeping the existing @theme inline convention and the data-theme="dark"
   switch. Keep every token name already used in the codebase working — if a
   name changes, update all usages in the same commit.
2. Install @fontsource-variable/inter and wire it up. The project currently
   sets no font at all, so the UI renders in a different system font on every
   device. Inter is required by the design.
3. Remove Bootstrap: drop the two imports from src/app/main.jsx, delete the
   --bs-* bridge variables and the !important overrides for a.card-cta and
   .specialist-sidebar-card a in index.css. First grep for bootstrap class
   names (row, col-*, container, btn, d-flex, modal, navbar) and list every
   file that uses them, with a plan to replace each with Tailwind. If anything
   genuinely depends on Bootstrap JS, tell me before deleting.
4. Make PromotionBadge read the --promo-bump / --promo-vip / --promo-premium
   tokens instead of hardcoded Tailwind colours. Mark the purple `premium`
   token and Badge variant="premium" as deprecated and list every usage.

Report: which files changed, what the Bootstrap removal touches, and anything
in the design that contradicts the existing code.
```

## Stage 1 — shared UI

```
Rebuild shared/ui against design/components.md: Button (primary, secondary,
ghost, icon), Input, Select, Checkbox, Radio, Badge, Chip, RatingStars,
CardWrapper, CategoryCard, Skeleton, Breadcrumbs, Pagination, EmptyState.

Rules:
- Tokens only, no literal hex anywhere.
- 44px minimum interactive height, including icon buttons.
- Every input has a visible label; sr-only only where a toolbar makes it
  redundant.
- In dark theme, --primary is a fill colour only. Links, prices and accent
  icons use --primary-text.
- lucide-react icons at stroke width 1.5.

Write them so a page can be assembled without touching raw Tailwind colour
classes. Show me the Button and Badge first, then continue once I approve.
```

## Stage 2 — layout shell

```
Rebuild Header and Footer per design/pages.md, and migrate them off SCSS to
Tailwind. Header: sticky, nav with the Parts mega-menu, language switcher
(AZ/RU/EN), theme toggle, Favorites, Account, "+ Add listing". Mobile: logo,
language, Favorites, hamburger with the nav in a drawer.

Then add the ad-rail layout wrapper: 160px sticky columns either side of a
1200px content column, visible only at >=1440px, hidden below with no other
layout change.

Delete the SCSS files you replace — do not leave both.
```

## Stage 3 — entity cards

```
Rebuild the car, part, service, specialist and seller cards per
design/components.md and the screenshots. Each card is one component used by
both its index page and the home page — no page-local copies.
```

## Stage 4 onwards — one page per prompt

Order: Home → Cars → Rent → Parts → Services → Specialists → Sellers →
Car detail (sale) → Car detail (rent) → Part → Service → Specialist → Seller →
Promote → About → 404.

```
Rebuild <PAGE> per the "<PAGE>" section of design/pages.md and
design/screenshots/<page>.png. Reuse shared/ui and the entity cards — add
nothing page-local that belongs in the shared layer.

All account actions link to the external app placeholder URLs. Every string
goes through i18next with az/ru/en keys; do not hardcode English in JSX.

Migrate any SCSS this page still uses to Tailwind and delete the .scss file.
```

---

## Standing rules to repeat in each prompt

- Tokens only. A missing colour means a missing token, not a hex literal.
- Both themes must work on every screen. Two pages currently force a theme —
  `AuthLayout` is pinned dark and the specialist page is pinned light. Remove
  both pins; the toggle must work everywhere.
- Mobile first: grids collapse 4 → 2 → 1, detail pages get a sticky bottom bar
  with the primary action, index pages get the filter drawer.
- Paid placement is always visibly labelled.
- No new dependency without asking.

## Known decisions baked into this pack

- **Premium is amber, not purple.** The purple `premium` token predates the
  promotion tiers. If you would rather keep purple, change `--promo-premium`
  and `--promo-premium-fill` in `tokens.css` and say so — the badge, the
  promote page and the canvas all follow the token.
- **Dark primary.** `#2563EB` stays the button fill with white text (5.1:1).
  `#60A5FA` is the text/link/price colour. `#2563EB` as text on `#0F172A` is
  ~3.1:1 and fails AA — do not use it that way.
- **Inter** is required; the current system-font default is not a design.
- **Bootstrap goes.** It is loaded without layers, overrides Tailwind, and is
  currently patched with `!important` hacks.
