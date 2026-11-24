import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ROUTES, withLang } from '@/shared/constants/routes';
import { useLanguageSync } from '@/shared/hooks/useLanguageSync';
import { HeaderLanguageSelector } from '@/shared/layout/Header/HeaderUtilities';
import Button from '@/shared/ui/button';
import logoUrl from '@/assets/images/autobaz-logo.svg';

const columnTitleClass =
  'mb-3 text-[12px] font-semibold uppercase leading-none tracking-[0.06em] text-muted-foreground';

const linkClass =
  'inline-flex min-h-9 items-center text-[14px] text-muted-foreground no-underline transition-colors hover:text-foreground hover:underline hover:underline-offset-4';

const FooterColumn = ({ title, links }) => (
  <div>
    <h2 className={columnTitleClass}>{title}</h2>
    <ul className="flex list-none flex-col">
      {links.map((link) => (
        <li key={link.label}>
          <Link to={link.to} className={linkClass}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const { t } = useTranslation('common');
  const { language, setLanguage } = useLanguageSync();

  const columns = [
    {
      title: t('footer.company'),
      links: [
        { label: t('footer.about'), to: ROUTES.about },
        { label: t('footer.press'), to: ROUTES.about },
      ],
    },
    {
      title: t('footer.forBuyers'),
      links: [
        { label: t('footer.browseCars'), to: withLang(ROUTES.cars, language) },
        { label: t('footer.rentCar'), to: ROUTES.rent },
        { label: t('footer.findParts'), to: ROUTES.parts },
      ],
    },
    {
      title: t('footer.forSellers'),
      links: [
        { label: t('footer.postListing'), to: ROUTES.add },
        { label: t('footer.promoteListing'), to: ROUTES.add },
      ],
    },
    {
      title: t('footer.forDealers'),
      links: [
        { label: t('footer.dealerAccounts'), to: ROUTES.sellers },
        { label: t('footer.bulkUpload'), to: ROUTES.add },
      ],
    },
  ];

  const legalLinks = [
    { label: t('footer.privacy'), to: `${ROUTES.about}#privacy` },
    { label: t('footer.imprint'), to: ROUTES.about },
    { label: t('footer.help'), to: ROUTES.about },
  ];

  return (
    <footer className="mt-12 border-t border-border bg-background pb-[calc(var(--scroll-top-bottom)+3.5rem)]">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))] lg:gap-6">
          {/* Brand, tagline, and the legal links that sit under them in the design. */}
          <div>
            <Link to={ROUTES.home} className="inline-flex items-center" aria-label={t('common.goHome')}>
              <img src={logoUrl} alt="AutoBaz" className="block h-9 w-auto" />
            </Link>
            <p className="mt-3 max-w-[280px] text-[14px] leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">AutoBaz</span> — {t('footer.tagline')}
            </p>

            <h2 className={`${columnTitleClass} mt-6`}>{t('footer.legalAndHelp')}</h2>
            <ul className="flex list-none flex-col">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {columns.map((column) => (
            <FooterColumn key={column.title} title={column.title} links={column.links} />
          ))}
        </div>

        {/* Phones get the one action that matters instead of a wall of links. */}
        <Button asChild className="mt-8 w-full md:hidden">
          <Link to="/add">
            <Plus size={18} aria-hidden="true" />
            {t('nav.addListing')}
          </Link>
        </Button>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row">
          <p className="text-[13px] text-muted-foreground">{t('footer.copyright')}</p>
          <HeaderLanguageSelector value={language} onChange={setLanguage} />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
