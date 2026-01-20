/**
 * @typedef {Object} PartsFilter
 * @property {string} search
 * @property {string} category
 * @property {string} brand
 * @property {string} model
 * @property {string} condition
 * @property {string | number} priceFrom
 * @property {string | number} priceTo
 * @property {string} location
 * @property {string} sort
 * @property {number} limit
 * @property {number} offset
 */

/**
 * @typedef {Object} PartEntity
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} brand
 * @property {string} model
 * @property {string} condition
 * @property {string} description
 * @property {number} price
 * @property {string} currency
 * @property {string} oemCode
 * @property {string[]} compatibility
 * @property {number} stock
 * @property {string} location
 * @property {string} imageUrl
 * @property {string | string[]} image
 * @property {{ id: string; name?: string; logo?: string; avatarUrl?: string; type?: string; hasPublicPage?: boolean; rating?: number; votes?: number } | null} seller
 */

/**
 * @typedef {Object} PartsResult
 * @property {PartEntity[]} items
 * @property {number} total
 */
