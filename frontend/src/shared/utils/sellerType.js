/**
 * The three kinds of seller the API knows: `SellerType` is PRIVATE | DEALER | PARTS_DEALER.
 * There is no fourth kind for rental companies — renting is a listing purpose, not a
 * type of seller — so the filter and the labels stop at three.
 *
 * The list query returns the enum as written (`PARTS_DEALER`) while the seller nested in
 * a vehicle or a part arrives lower-cased (`parts_dealer`). Both spellings, and nothing
 * else, collapse to one of `dealer`, `parts`, `private` here, so no caller has to know.
 */
export const SELLER_TYPES = ['dealer', 'parts', 'private'];

const ALIASES = {
  dealer: 'dealer',
  parts: 'parts',
  parts_dealer: 'parts',
  private: 'private',
};

/** @returns {'dealer' | 'parts' | 'private' | null} null when the value is not a known type. */
export const normalizeSellerType = (raw) => {
  const key = String(raw ?? '').trim().toLowerCase();
  return ALIASES[key] ?? null;
};

/** Dealers and parts dealers have a public page; private individuals do not. */
export const hasPublicSellerPage = (raw) => {
  const type = normalizeSellerType(raw);
  return type === 'dealer' || type === 'parts';
};
