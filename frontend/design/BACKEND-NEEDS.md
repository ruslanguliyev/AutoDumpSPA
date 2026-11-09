# Backend gaps (design vs `backend/src/schema.gql`)

One line per missing capability. “Blocks” = public page or filter called out in `pages.md`.

- **Part aggregate `rating` / `reviewsCount` on `PartObject`** — blocks part detail and part card review stars (only seller rating exists today).
- **`SellerObject.coverImage` and `SellerObject.logoUrl`** — blocks seller directory card cover strip and logo avatar on `/sellers`.
- **Listing `publishedAt` / `createdAt` on catalog rows (`PartObject`, `VehicleObject`, or joined listing)** — blocks trustworthy “Newest first” sort on `/parts` and `/cars` (sort is client-side without a date field).
- **`PartsFilterInput.inStockOnly` (or stock > 0 predicate)** — blocks server-side “In stock only” on `/parts` (UI hides the checkbox until the full page is loaded).
- **`PartsFilterInput.sort` / relevance ranking** — blocks server-side sort on `/parts` (toolbar sort is not sent to the API).
- **`VehiclesFilterInput` max deposit / `depositTo` on `RentalTermsObject`** — blocks rent sidebar “deposit” filter on `/rent` (`deposit` exists on terms, not in filter input).
- **`VehiclesFilterInput.vehicleClass` (or rental class field)** — blocks rent “class” filter on `/rent` (in `pages.md`, not wired).
- **Server-side rent price/day via existing `priceFrom` / `priceTo` on `VehiclesFilterInput` with honest `total`** — blocks removing the client-only price/day filter on `/rent` when the 500-row cap is hit.
- **`filterOptions` (or facet) query** — blocks replacing the parts index 10 000-row fetch used only to populate brand/location selects.
- **Canonical **city list** query** — blocks shared city dropdowns on index pages (sellers cities are derived from the loaded seller array).
- **`VehiclesFilterInput.bodyType`** — blocks cars index body-type filter (`VehicleObject.bodyType` exists; filter input does not).
- **`SpecialistsFilterInput` brand / supported-vehicle match** — blocks server-side “vehicles serviced” on `/specialists` (`SpecialistObject.supportedVehicles` exists; filter input has no brand/vehicle fields; frontend shows the control only for the real API).
- **`SpecialistsFilterInput` → wire `available` for “Available now”** — optional: field exists on filter input but specialists index still applies availability client-side after fetch.
- **Service centre list filters** (`serviceTypes`, `brands`, `ratingFrom`, `verifiedOnly` on query)** — blocks server-side services sidebar filters on `/services` (only `city` is passed to GraphQL today).
- **Private sellers (`SellerType.PRIVATE`) in public directory** — product decision pending: `pages.md` lists “private” seller type; `/sellers` deliberately excludes private profiles until policy is set.
