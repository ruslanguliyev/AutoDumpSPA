# Backend gaps (design vs `backend/src/schema.gql`)

One line per missing capability. “Blocks” = public page or filter called out in `pages.md`.

- **Part aggregate `rating` / `reviewsCount` on `PartObject`** — blocks part-level review stars on detail header and cards (detail uses seller `ReviewsSection` instead; `PartSellerObject` has `rating` but no `reviewsCount`, so sidebar stars stay hidden).
- **`SellerObject.coverImage` and `SellerObject.logoUrl`** — blocks seller profile hero cover and directory card strip (`SellerDetailPage` still has no cover from API; uses initials avatar only).
- **`PartSellerObject.reviewsCount`** — blocks seller review count beside rating on part detail `MiniSellerCard` (`rating` exists; count is not queried).
- **`SpecialistObject.certifications` / `validUntil`** — blocks certifications block on specialist detail (`pages.md`; portfolio uses `portfolio[]` from schema).
- **Listing `publishedAt` / `createdAt` on catalog rows (`PartObject`, `VehicleObject`, or joined listing)** — blocks trustworthy “Newest first” sort on `/parts` and `/cars` (sort is client-side without a date field).
- **`PartsFilterInput.inStockOnly` (or stock > 0 predicate)** — blocks server-side “In stock only” on `/parts` (UI hides the checkbox until the full page is loaded).
- **`PartsFilterInput.sort` / relevance ranking** — blocks server-side sort on `/parts` (toolbar sort is not sent to the API).
- **`VehiclesFilterInput` max deposit / `depositTo` on `RentalTermsObject`** — blocks rent sidebar “deposit” filter on `/rent` (`deposit` exists on terms, not in filter input).
- **`VehiclesFilterInput.vehicleClass` (or rental class field)** — blocks rent “class” filter on `/rent` (in `pages.md`, not wired).
- **Server-side rent price/day via existing `priceFrom` / `priceTo` on `VehiclesFilterInput` with honest `total`** — blocks removing the client-only price/day filter on `/rent` when the 500-row cap is hit.
- **`filterOptions` (or facet) query** — blocks replacing the parts index 10 000-row fetch used only to populate brand/location selects.
- **Canonical **city list** query** — blocks shared city dropdowns on index pages (sellers cities are derived from the loaded seller array).
- **`VehiclesFilterInput.bodyType`** — blocks cars index body-type filter (`VehicleObject.bodyType` exists; filter input does not).
- **`VehiclesFilterInput.drive` / `engineVolumeFrom`+`engineVolumeTo` / `powerFrom`+`powerTo`** — blocks cars advanced “body and specs” ranges and drivetrain chips (`VehicleObject.drive`, `engineVolume`, `power` exist).
- **`VehiclesFilterInput.mileageFrom`+`mileageTo` / `hasDamage` / `isRepainted` / `wasInAccident`** — blocks cars advanced condition group (`VehicleObject.mileage`, `hasDamage`, `isRepainted`, `wasInAccident` exist).
- **`VehiclesFilterInput.sellerType` / `isCreditAvailable` / `isBarterAvailable`** — blocks cars “seller and terms” segment and credit/barter chips (`VehicleSellerObject.type`, `VehicleObject.isCreditAvailable`, `isBarterAvailable` exist).
- **`VehiclesFilterInput.color` / `seatsCount` / `marketRegion`** — blocks cars “other” group (`VehicleObject.color`, `seatsCount`, `marketRegion` exist; no color/seats/market catalogs on the API).
- **`VehiclesFilterInput.fuel` and `transmission` as `[String]`** — filter input is a single `String`; cars UI multi-selects are applied only on the client catalogue chunk.
- **`SpecialistsFilterInput` brand / supported-vehicle match** — blocks server-side “vehicles serviced” on `/specialists` (`SpecialistObject.supportedVehicles` exists; filter input has no brand/vehicle fields; frontend shows the control only for the real API).
- **`SpecialistsFilterInput` → wire `available` for “Available now”** — optional: field exists on filter input but specialists index still applies availability client-side after fetch.
- **Service centre list filters** (`serviceTypes`, `brands`, `ratingFrom`, `verifiedOnly` on query)** — blocks server-side services sidebar filters on `/services` (only `city` is passed to GraphQL today).
- **`ServiceCenterObject` lat/lng (or map URL)** — blocks “View map” on service detail; address is shown as text until coordinates exist.
- **`SellerObject.responseTime` (or derived SLA) on `VehicleSellerObject`** - blocks sidebar "Responds within" on car detail; not in any seller GraphQL shape, so the row is not drawn.
- **`VehicleObject.createdAt` / `VehicleSellerObject.createdAt` + `reviewsCount`** - car detail reads them today through two extra calls (`listing(id)` and `sellerById(id)`, skipped for sellers without a public page). Embedding them removes two round trips per page view.
- **`VehicleObject.code` ("Vehicle code") and `VehicleObject.isFinanced` ("Financed")** - both rows are in `pages.md` car specs; neither field exists in the schema, so the rows are not drawn.
- **`RentalTermsObject.vehicleClass` / rental class** - blocks the "class" line in the rent booking card terms (`pages.md`); only deposit, min/max days, km per day and min driver age exist.
- **Promote tariff copy in `pages.md` (fixed 3.00 / 5.00 / 7.00 AZN tables)** — frontend must not invent those amounts. `/promote` renders only `promotionQuote.packages` (`amount` / `listAmount` / `creditAmount` in qapik). Empty packages → empty state, not the design mock prices.
- **Dashboard profile scope (`sellerId` / `serviceCenterId` on mine-queries)** — `myListings`, `receivedInquiries`, `unreadInquiriesCount`, `incomingAppointments`, `incomingRentalBookings` and `myPromotions` all resolve the current user's seller/centre by `userId`. There is no argument to fetch another seller or centre, and a user has at most one of each. Client can only filter the returned rows (listing `kind`, appointment `targetId`, promotion `targetType`). Personal vs dealer listings cannot be split, so the switcher hides «Дилер» until `myListings` (and the other mine-queries) accept `sellerId` independently of the user's personal listings. «Сервис» stays because appointments and service listings differ. Listing promotions stay on the personal sidebar while a Seller exists.
- **Dashboard stats query** — no `dashboardStats` (or similar) in the schema; overview numbers are counted from `myListings` + inquiries on the client.
- **Public site totals (e.g. `siteStats { activeListings serviceCenters specialists }` — pages.md also names verified sellers and reviews)** — blocks the three-number row on `/about`. No query returns counts without paging whole catalogues, so the row is not drawn (option «а»); the page has mission, four steps and the contact block only.
