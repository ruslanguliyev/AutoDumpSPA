/**
 * Maps URL slugs (human-readable, SEO-friendly) to canonical category values
 * used by filters and API. Enables separation of presentation (URL) from domain logic.
 *
 * Includes:
 * - FeaturedCategories slugs (headlights, brake-rotors, etc.)
 * - Mega menu canonical values (lighting, brake, etc.) — passthrough or mapping
 */

/** Slug from URL → canonical value for filter/API (lowercase, matches PART_CATEGORIES) */
export const CATEGORY_SLUG_TO_VALUE: Record<string, string> = {
  // FeaturedCategories slugs
  'brake-rotors': 'brakes',
  'engine-oil': 'engine',
  'spark-plugs': 'engine',
  batteries: 'electrical',
  tires: 'wheels',
  suspension: 'suspension',
  headlights: 'lighting',
  filters: 'engine',
  exhaust: 'exterior',
  wheels: 'wheels',
  interior: 'interior',
  electronics: 'electrical',
  body: 'body',
  transmission: 'transmission',
  // Mega menu uses canonical values directly — passthrough
  engine: 'engine',
  brakes: 'brakes',
  brake: 'brakes',
  lighting: 'lighting',
  electrical: 'electrical',
  exterior: 'exterior',
  oils: 'engine',
  tire: 'wheels',
  accessories: 'body',
};

/** Canonical value → slug for URL (used when serializing filter to URL) */
export const CATEGORY_VALUE_TO_SLUG: Record<string, string> = {
  brakes: 'brake-rotors',
  engine: 'engine-oil',
  electrical: 'electronics',
  wheels: 'wheels',
  suspension: 'suspension',
  lighting: 'headlights',
  exterior: 'exhaust',
  interior: 'interior',
  body: 'body',
  transmission: 'transmission',
};
