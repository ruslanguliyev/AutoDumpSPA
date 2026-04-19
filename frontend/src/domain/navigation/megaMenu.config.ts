/**
 * Structured mega menu config for navigation.
 * All labels use i18n keys — no hardcoded strings in components.
 */

export interface MegaMenuLink {
  /** i18n key for label (e.g. "nav.megaMenu.parts.categories.engine") */
  labelKey: string;
  /** Optional href — if omitted, item is a category header or filter entry */
  href?: string;
}

export interface MegaMenuSection {
  /** i18n key for section title */
  titleKey: string;
  items: MegaMenuLink[];
}

export interface MegaMenuConfig {
  id: string;
  /** Main link (e.g. /parts, /services) */
  href: string;
  sections: MegaMenuSection[];
}

/** Parts (Ehtiyat hissələri) mega menu structure */
export const PARTS_MEGA_MENU: MegaMenuConfig = {
  id: 'parts',
  href: '/parts',
  sections: [
    {
      titleKey: 'nav.megaMenu.parts.sections.categories',
      items: [
        { labelKey: 'nav.megaMenu.parts.categories.engine', href: '/parts?category=engine' },
        { labelKey: 'nav.megaMenu.parts.categories.transmission', href: '/parts?category=transmission' },
        { labelKey: 'nav.megaMenu.parts.categories.suspension', href: '/parts?category=suspension' },
        { labelKey: 'nav.megaMenu.parts.categories.brake', href: '/parts?category=brake' },
        { labelKey: 'nav.megaMenu.parts.categories.electronics', href: '/parts?category=electronics' },
        { labelKey: 'nav.megaMenu.parts.categories.body', href: '/parts?category=body' },
        { labelKey: 'nav.megaMenu.parts.categories.lighting', href: '/parts?category=lighting' },
        { labelKey: 'nav.megaMenu.parts.categories.interior', href: '/parts?category=interior' },
        { labelKey: 'nav.megaMenu.parts.categories.oils', href: '/parts?category=oils' },
        { labelKey: 'nav.megaMenu.parts.categories.tire', href: '/parts?category=tire' },
        { labelKey: 'nav.megaMenu.parts.categories.accessories', href: '/parts?category=accessories' },
      ],
    },
    {
      titleKey: 'nav.megaMenu.parts.sections.byCar',
      items: [
        { labelKey: 'nav.megaMenu.parts.byCar.brand', href: '/parts' },
        { labelKey: 'nav.megaMenu.parts.byCar.model', href: '/parts' },
        { labelKey: 'nav.megaMenu.parts.byCar.year', href: '/parts' },
      ],
    },
    {
      titleKey: 'nav.megaMenu.parts.sections.brands',
      items: [
        { labelKey: 'nav.megaMenu.parts.brands.bosch', href: '/parts?brand=bosch' },
        { labelKey: 'nav.megaMenu.parts.brands.brembo', href: '/parts?brand=brembo' },
        { labelKey: 'nav.megaMenu.parts.brands.valeo', href: '/parts?brand=valeo' },
        { labelKey: 'nav.megaMenu.parts.brands.ngk', href: '/parts?brand=ngk' },
        { labelKey: 'nav.megaMenu.parts.brands.denso', href: '/parts?brand=denso' },
      ],
    },
    {
      titleKey: 'nav.megaMenu.parts.sections.popular',
      items: [
        { labelKey: 'nav.megaMenu.parts.popular.headlight', href: '/parts?q=fara' },
        { labelKey: 'nav.megaMenu.parts.popular.bumper', href: '/parts?q=bumper' },
        { labelKey: 'nav.megaMenu.parts.popular.shock', href: '/parts?q=amortizator' },
        { labelKey: 'nav.megaMenu.parts.popular.battery', href: '/parts?q=akkumulyator' },
      ],
    },
  ],
};

/** Auto Xidmətləri mega menu structure */
export const AUTO_SERVICES_MEGA_MENU: MegaMenuConfig = {
  id: 'auto_services',
  href: '/services',
  sections: [
    {
      titleKey: 'nav.megaMenu.autoServices.section',
      items: [
        { labelKey: 'nav.megaMenu.autoServices.serviceCenters', href: '/services?type=garage' },
        { labelKey: 'nav.megaMenu.autoServices.tuning', href: '/services?type=tuning' },
        { labelKey: 'nav.megaMenu.autoServices.detailing', href: '/services?type=detailing' },
        { labelKey: 'nav.megaMenu.autoServices.diagnostics', href: '/services?type=diagnostics' },
        { labelKey: 'nav.megaMenu.autoServices.tireService', href: '/services?type=tire' },
        { labelKey: 'nav.megaMenu.autoServices.electrician', href: '/services?type=electric' },
        { labelKey: 'nav.megaMenu.autoServices.ac', href: '/services?type=ac' },
        { labelKey: 'nav.megaMenu.autoServices.mobileService', href: '/services?type=mobile' },
      ],
    },
  ],
};
