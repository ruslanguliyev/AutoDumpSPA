# AutoBaz — page structure

Sections are listed in render order. Every account action (login, register,
post a listing, send message, booking, payment) links out to
`https://autobaz.az/...` — no backend work on this site.

Copy is written in English and must go through i18next. Locales: **az** (default),
**ru**, **en**.

---

## Global header (sticky, every page)

Logo "AutoBaz" · nav: Cars, Rent, Parts (mega-menu: Categories / By car / Brands /
Popular), Auto Services, Specialists, Sellers · right side: language switcher
(AZ / RU / EN), theme toggle, Favorites, Account, primary "+ Add listing".

On mobile: logo, language, Favorites, hamburger. Nav moves into the drawer.

## Global footer (every page)

Logo + tagline "A marketplace for everything automotive: cars for sale and rent,
parts, mechanics and auto services." Columns: Company (About us, Press),
For buyers, For sellers, For dealers, Legal (Privacy, Imprint), Help / FAQ.
Bottom bar: "© 2026 AutoBaz" + language switcher.

---

## 1. Home — `/`

1. **Hero** — H1 "Everything for your car, in one place", subtitle, tabbed search
   card (Cars / Rent / Parts / Services / Specialists). Cars tab fields: Brand,
   Model, Max price, Year, City + "Show results". Three trust points under it:
   Verified sellers · Real reviews · Free to browse.
2. **Featured categories** — title + "View all", 12 tiles in 6 columns
   (2 on mobile): Brake rotors, Engine oil, Spark plugs, Batteries, Tires,
   Suspension, Headlights, Filters, Exhaust, Wheels, Interior, Electronics.
3. **Promoted** — title + outlined "Ad" pill, 4 car cards with PREMIUM badges.
4. **Featured vehicles** — title + "View inventory", 4 car cards.
5. **You may also like** — 4 part cards.
6. **Top auto services** — title + "Find services", 4 service cards.
7. **Top specialists** — title + "Find specialists", 4 specialist cards.
8. **How it works** — two columns, For buyers / For sellers, 3 numbered steps
   each, button "Browse listings" / "Post a listing".
9. **Promotion teaser** — Bump / VIP / Premium cards with check lists, button
   "Promote a listing", footnote "No account needed. Paid placement is always
   labelled."
10. **FAQ** — accordion, 6 questions: how to post, is it free, how promotion
    works, paying without an account, booking a mechanic, reporting a listing.

Ad rails appear either side above 1584px — see the Ad rails note in
`components.md` for why that figure is not 1440px.

---

## 2–7. Index pages

Shared skeleton: breadcrumbs → H1 + result count + sort select → filter sidebar
(drawer on mobile) → 3-column card grid → pagination.

| Page | Route | Filters | Extra |
|---|---|---|---|
| Cars | `/cars` | brand, model, year, price, fuel, transmission, city | "Promoted" strip of 4 cards above results |
| Rent | `/rent` | + date-range availability, class, deposit, price/day | price shows "/ day"; card lists deposit, min days, km/day; CTA "Check availability" |
| Parts | `/parts` | category, car brand, condition, price, city, in-stock only | search by name or OEM |
| Services | `/services` | city, brand serviced, service type, rating, verified only | open/closed status on card |
| Specialists | `/specialists` | city, specialization, vehicles, rating, available now | price from / on request |
| Sellers | `/sellers` | type (dealer / parts / private / rental), city, verified | search by name; listing count on card |

---

## 8. Car detail — `/vehicles/{slug}`

Breadcrumbs `Home > Cars > Brand Model`.

**Main:** gallery (16:9, arrows, counter "3 / 12", thumbnail strip, fullscreen
lightbox) → summary card (H1, subtitle `engine · transmission`, price
right-aligned, 4 tiles: Year, Mileage, Fuel type, Transmission) → Specifications
(two columns, dashed separators: Brand, Model, Version, Vehicle code, Body type,
Year, Engine, Transmission, Drive, Mileage, Location, Number of owners,
Financed, Published, Views — hide empty rows; then full-width Owner comment) →
"Mechanics for this car" (up to 3 specialist cards, 2 columns, dashed empty
state).

**Sidebar (360px, sticky):** seller card (avatar, name, Dealer/Private, Verified,
stars, location, Member since, Responds within) → "Show phone number" (reveals on
click) → "Add to favorites" toggle → contact form (textarea, optional phone,
Send, success state "Message sent") → promote shortcuts → report link → Safety
tips (shield icon; meet in a public place, inspect in person, never pay in
advance, check the documents).

**Rent variant:** price gets "/ day"; a booking card sits **above** the contact
form — date range with unavailable days greyed out, live total
`N days × price = total`, terms (deposit or "No deposit", min days, max days,
km per day or "Unlimited km", min driver age), message, phone,
"Request booking". States: past date, too short, too long, unavailable days in
range, "Request sent", "Log in to book".

---

## 9. Part detail — `/parts/{slug}`

Gallery → main card (H1, filled category pill, `Brand: X`, `OEM: code` in
monospace, stars right-aligned) → tab bar Description / Specifications /
Compatibility / Reviews, **default Specifications**, 2px primary underline
indicator.

- Specifications: two columns split by a vertical divider — *Main info*
  (Article/OEM, Condition, Location) and *Details* (Brand, Category, Availability).
- Compatibility: chips of compatible models.
- Reviews: the shared reviews block.

**Sidebar:** purchase card (price, "In stock: N" green or "Out of stock", Add to
favorites, primary "Contact seller", caption "LISTING INFO") → mini seller card
with "View seller" → Buyer protection (Verified seller, Secure payment) →
promote shortcuts → report link.

No cart, no checkout.

---

## 10. Service center — `/services/{slug}`

Cover strip above the grid: logo, name, VERIFIED, stars + reviews, Share.
Breadcrumbs `Home > City > Services > Name`.

**Main:** gallery → Price list (service name, one-line description, duration,
"from X AZN" or "No price", optional Popular / Hot mini-badges) → "Brands we
service" chips → "Mechanics at this center" (2 columns, dashed empty state) →
reviews block.

**Sidebar:** status (green "Open now" / "Closed", "Closes at 19:00") → Call now /
WhatsApp / Website → Opening hours, 7 rows, today highlighted with "(Today)" →
Contact details (phone, email, address, "View map") → Book a visit (date, time,
car, phone, note, "Request visit"; states: sent, log in to book, not accepting
bookings) → promote shortcuts.

---

## 11. Specialist — `/specialists/{slug}`

**Main:** hero (cover, large round avatar with verified overlay, name, stars,
years of experience, city, specialisation chips) → portfolio gallery (only when
images exist) → About + three Highlights tiles (Fast response, Top rated,
Warranty on work) → Certifications with "Valid until {date}" (only when any) →
reviews block.

**Sidebar:** availability badge (Available green / Unavailable grey) → "Starting
at X AZN" or "Price on request" → Call / WhatsApp / Send message → Contact info →
Book a visit form → promote shortcuts.

**Full width below:** "Similar specialists" — 4 cards.

---

## 12. Seller profile — `/sellers/{slug}`

Header: cover, avatar (logo or initials), name, "Verified Dealer" /
"Verified Parts Seller", stars + reviews, "Active seller — N yrs", city, listing
count. Actions: Show number, WhatsApp, Instagram, Share, Add to favorites.

Tabs: **Stock** / Parts / Reviews / About.
Stock and Parts: "Search in stock" field + 3-column grid, empty state
"Nothing found". Reviews: shared block. About: description or "About us coming
soon" + member since / type / responds within tiles.

---

## 13. Promote — `/promote`

H1 "Promote your listing". Three tier cards with icon, price, summary, check
list and a duration selector showing **both** the total and the per-unit price:

- **Bump** — 1 / 3 / 5 / 10 bumps · 3.00 / 8.00 / 12.00 / 20.00 AZN
- **VIP** — 1 / 5 / 15 / 30 days · 5.00 / 20.00 / 52.50 / 90.00 AZN
- **Premium** — 1 / 5 / 15 / 30 days · 7.00 / 30.00 / 78.00 / 135.00 AZN

Button "Continue" → external app. Notes: no account needed · paid placement is
always labelled as an advert · upgrade later and pay only the difference.

---

## 14. About — `/about`

Mission statement → three numbers (active listings, verified sellers, reviews
written) → "How AutoBaz works" in four steps → contact CTA with a separate
"For dealers" button.

## 15. 404

Large muted "404", "This page took a wrong turn", explanation that the listing
may have been sold or removed, search field, "Back to home", chips linking to
the six index pages.

---

## Mobile specifics

- Card grids: 4 → 2 → 1 columns.
- Header sticky; nav in a drawer.
- Index pages: Filters button with an active-filter count, sort select beside
  it, removable filter chips below, "Load more" instead of numbered pagination.
- Filter drawer: bottom sheet, grabber, scrollable body, sticky footer
  ("Clear all" + "Show N cars").
- Detail pages: sticky bottom bar carries the primary action
  (Show phone number / Request booking / Call now / Request visit).
