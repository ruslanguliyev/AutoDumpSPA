# AvtoBaz — component spec

Every component below is defined by **tokens**, never by literal hex values.
If a colour you need is not in `tokens.css`, that is a gap in the token set —
add the token, do not hardcode.

Rules that hold everywhere:

- Icons: `lucide-react`, stroke width **1.5**, size 14–26px depending on context.
- Interactive targets: minimum **44px** height, including icon-only buttons.
- Radius: `rounded-[var(--radius)]` (10px) for buttons/inputs, `rounded-2xl` (16px)
  for cards and panels, `rounded-full` for badges and chips.
- Shadows only in light theme carry weight; in dark they are nearly invisible
  and the border does the work. Both come from the same token.
- Never use `--destructive` for anything except validation errors and Report.
- Never use colour alone to carry meaning — pair it with a label or an icon.

---

## Typography

| Role | Size | Weight | Token |
|---|---|---|---|
| H1 hero | 52px (mobile 28px) | 600 | `foreground` |
| H1 inner page | 30px (mobile 22px) | 600 | `foreground` |
| H2 section | 30px (mobile 20px) | 600 | `foreground` |
| H2/H3 in card | 17–20px | 600 | `foreground` |
| Body | 15–16px, line-height 1.6 | 400 | `foreground` |
| Card meta | 13–14px | 400 | `muted-foreground` |
| Label | 12px, uppercase, letter-spacing 0.06em | 600 | `muted-foreground` |
| Price on card | 20px | 700 | `foreground` |
| Price on detail page | 28–30px | 700 | `primary-text` |

Headings use `tracking-tight` (-0.02em; -0.025em on the hero).

---

## Buttons

Height 44px, radius 10px, font-size 15px, weight 600.

| Variant | Light | Dark |
|---|---|---|
| Primary | `bg-primary text-primary-foreground` | same — fill stays #2563EB, white text |
| Secondary | `border border-brand text-primary-text bg-transparent` | same |
| Ghost | `border border-border-strong text-foreground bg-transparent` | `border-border` |
| Icon-only | 44×44, same as ghost, always `aria-label` | same |

Hover darkens the fill slightly; focus shows a visible blue ring. Disabled: 50%
opacity, no pointer events.

**Do not use `--primary` as a text colour in dark theme.** Prices, links and
accent icons use `--primary-text`.

---

## Inputs

Height 44px (48px in the mobile filter drawer), radius 10px,
`bg-background border border-border-strong` in light, `bg-background
border-border` in dark, 15px text.

- Every input has a **visible** label above it (12px uppercase label style), not
  a placeholder standing in for one. Where the label is visually redundant
  (search field in a toolbar), keep it as `sr-only`.
- Validation text sits under the field, 13px, `text-destructive`, with the
  border switching to `--destructive`.
- Checkboxes and radios: 18–20px, `accent-color: rgb(var(--primary))`.
- Selects use the same box as text inputs.

---

## Badges and chips

Pill, 11–12px, weight 600, letter-spacing 0.04em, padding 3–4px / 10px.

| Badge | Style |
|---|---|
| Verified | outlined, `border-success text-success`, check icon |
| In stock | text only, `text-success`, 13px weight 600 |
| Out of stock | text only, `text-destructive` |
| Open now / Closed | dot + label, `text-success` / `text-muted-foreground` |
| HOT | filled `bg-promo-vip-fill text-promo-vip-on-fill` |
| VIP | filled `bg-promo-vip-fill text-promo-vip-on-fill` |
| PREMIUM | filled `bg-promo-premium-fill text-promo-premium-on-fill` |
| Ad | outlined, `border-muted-foreground text-foreground`, uppercase |
| Category | filled `bg-primary text-primary-foreground` |
| Filter chip | outlined `border-border text-muted-foreground`, optional ✕ |

`PromotionBadge` must read its colours from the `--promo-*` tokens. The old
purple `premium` token is deprecated — see the note at the bottom of
`tokens.css`.

The **Ad** row was corrected during the build: `--subtle-foreground` reaches only
2.6:1 as a border on the light background, below the 3:1 a border needs, and the
muted label was hard to read in dark. Paid placement has to be legible or the
label is not really a label, so the badge takes `border-muted-foreground` and
`text-foreground`.

---

## Rating stars

Five star outlines, stroke 1.5, filled up to the rounded value with `--star`,
the rest `--subtle-foreground`. Beside them: `4.8 (34 reviews)` at 13px
`muted-foreground`. Never render a bare number without the stars on cards.

---

## Cards

All cards: `bg-card border border-border rounded-2xl shadow-[var(--shadow-card)]`,
content padding 16px, internal gap 8px.

**Car card** — image 4:3 (`bg-card-muted` placeholder), heart button top-right
(44×44 target, translucent background), HOT badge top-left, VIP/Premium badge
top-left when promoted. Body order: price (20px/700) → title
`Brand Model — trim` (18px/600) → meta line
`2019 · 4.4L · 625 HP · 45,000 km · Automatic` (13px muted) → city with pin icon.

**Part card** — image 1:1, category pill, name (16px/600), stars with count,
stock status, price (20px/700) pushed to the bottom.

**Service card** — cover 16:9, Verified badge, open/closed status, name, stars +
city, brand chips, full-width secondary button "Book a visit" pinned to bottom.

**Specialist card** — centred, 72px round avatar with a 22px green check overlay
(2px card-coloured ring), name, stars + years, 2–3 specialisation chips, price
or "Price on request", availability dot, full-width secondary button.

**Seller card** — cover strip 76px, avatar overlapping it by −42px, name, type
pill + Verified, stars, city and listing count, secondary button.

**Category tile** — centred icon 26px in `primary-text` + label 14px, min-height
108px. Hover lifts the card and brightens the border.

---

## Reviews block

Reused on part, service, specialist and seller pages.

- Left: average `4.9` at **40px/700**, stars under it, `Based on N reviews`.
- Right: five bars, 5→1 stars, 8px tall, `bg-card-muted` track, `bg-star` fill,
  count right-aligned in a 32px column.
- List: bordered cards — author as `First name + initial.`, stars, date pushed
  right, comment 14px/1.6.
- `Show N more` ghost button.
- Write-a-review form: five 36×36 star buttons (each `aria-label`-ed), textarea,
  primary submit, plus a `Log in to review` link. Both go to the external app.
- Empty state: dashed box, "No reviews yet".

---

## Promote shortcuts

Three compact rows: 34px icon tile, tier name in its `--promo-*` colour, price
`from 3.00 AZN` under it. Caption: "Anyone can promote — no account needed."
Icons: arrow-up (Bump), gem (VIP), crown (Premium).

---

## Report link

13px `muted-foreground` with a flag icon, "Report listing". Opens a dialog:
reason select (Spam, Scam, Wrong info, Prohibited item, Already sold, Other) and
optional details; submit goes to the external app.

---

## Layout primitives

- **Breadcrumbs** — 13px muted, `/` separators, last item `foreground`.
- **Pagination** — 44px square buttons, current page `bg-primary
  text-primary-foreground`, prev/next icon buttons. On mobile this becomes a
  "Load more" button plus `Page 1 of 42` text.
- **Filter sidebar** — card, 280–320px, sticky; collapses into a bottom-sheet
  drawer under 1024px: grabber, scrollable body, sticky footer with
  "Clear all" + "Show 1,248 cars".
- **Detail layout** — fluid main + 360px sidebar, `sticky top-24`, 32px gap.
  Below 1024px the sidebar stacks under the main column and the primary action
  moves into a **sticky bottom bar** (icon button + full-width primary).
- **Ad rails** — only at ≥1440px: 160px sticky columns either side of the
  1200px content column, 160×600 and 160×250 slots, dashed placeholder with an
  "Ad" pill. Hidden below 1440px; nothing else changes.
- **Empty state** — dashed `border-border-strong` box, muted icon, one line of
  text, one link out.
- **Loading** — shimmer skeletons in `card-muted`, matching the real card's
  shape. Never a spinner on a card grid.

---

## Container widths

| Page | Max width |
|---|---|
| Home | 1200px |
| Everything else | 1280px |

Side gutter 16px, spacing scale in multiples of 8px. Card grids collapse
4 → 2 → 1 columns.
