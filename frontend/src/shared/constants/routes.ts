/** Public app paths. `cars` is the vehicles catalogue (`/cars`). */
export const ROUTES = {
  home: '/',
  about: '/about',
  cars: '/cars',
  rent: '/rent',
  parts: '/parts',
  vehicles: '/vehicles',
  sellers: '/sellers',
  dealers: '/dealers',
  services: '/services',
  specialists: '/specialists',
  add: '/add',
  login: '/login',
  register: '/register',
} as const;

/** react-router `path` without a leading slash. */
export const routePath = (href: string): string => href.replace(/^\//, '');

/** Prefix a ROUTES path with the active locale, e.g. `/az` + `/cars` → `/az/cars`. */
export const withLang = (path: string, lang: string): string => {
  if (!lang) return path;
  if (path === ROUTES.home) return `/${lang}`;
  return `/${lang}${path}`;
};
