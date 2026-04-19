const PUBLIC_SELLER_TYPES = new Set(["dealer", "reseller"]);

export const isPublicSeller = (seller) =>
  PUBLIC_SELLER_TYPES.has(seller?.type) && seller?.hasPublicPage === true;

export const isValidDomain = (domain) => domain === "cars" || domain === "parts";

export const addSellerListing = (sellersById, seller, expectedDomain) => {
  if (!seller?.id || !isPublicSeller(seller)) return;
  if (!isValidDomain(seller.domain) || seller.domain !== expectedDomain) return;

  const existing = sellersById.get(seller.id);
  if (existing) {
    existing.listingsCount += 1;
    // keep first non-empty city if available
    if (!existing.city && typeof seller.city === "string" && seller.city.trim()) {
      existing.city = seller.city.trim();
    }
    return;
  }

  sellersById.set(seller.id, {
    id: seller.id,
    name: seller.name ?? "Seller",
    logo: seller.logo,
    rating: seller.rating,
    votes: seller.votes,
    listingsCount: 1,
    domain: seller.domain,
    type: seller.type,
    city: typeof seller.city === "string" ? seller.city.trim() : undefined,
  });
};

export const buildSellersList = (vehicles, parts) => {
  const sellersById = new Map();

  vehicles.forEach((vehicle) => {
    addSellerListing(sellersById, vehicle?.seller, "cars");
  });

  parts.forEach((part) => {
    addSellerListing(sellersById, part?.seller, "parts");
  });

  return Array.from(sellersById.values());
};

export const buildSellersListLegacy = (vehicles, parts) => {
  const map = new Map();

  vehicles.forEach((vehicle) => {
    if (!vehicle?.seller || !isPublicSeller(vehicle.seller)) return;
    const seller = vehicle.seller;
    if (!map.has(seller.id)) {
      map.set(seller.id, {
        ...seller,
        listingsCount: 0,
        domain: "cars",
      });
    }
    map.get(seller.id).listingsCount++;
  });

  parts.forEach((part) => {
    if (!part?.seller || !isPublicSeller(part.seller)) return;
    const seller = part.seller;
    if (!map.has(seller.id)) {
      map.set(seller.id, {
        ...seller,
        listingsCount: 0,
        domain: "parts",
      });
    }
    map.get(seller.id).listingsCount++;
  });

  return Array.from(map.values());
};
