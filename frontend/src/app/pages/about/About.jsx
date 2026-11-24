import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FilePlus2, MessageSquare, Search, SquareStack } from 'lucide-react';

import { ROUTES, withLang } from '@/shared/constants/routes';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useLanguageSync } from '@/shared/hooks/useLanguageSync';
import Button from '@/shared/ui/button';

const STEPS = [
  { key: 'step1', Icon: Search },
  { key: 'step2', Icon: SquareStack },
  { key: 'step3', Icon: MessageSquare },
  { key: 'step4', Icon: FilePlus2 },
];

/**
 * /about — mission, how the site works in four steps, and a contact call to action.
 *
 * pages.md also asks for a row of three numbers (listings, sellers, reviews). No query returns
 * them, so the row is left out rather than filled with invented figures; see BACKEND-NEEDS.md.
 */
export default function About() {
  const { t } = useTranslation('common');
  const { language } = useLanguageSync();
  useDocumentTitle(t('about.title'));
  const { hash } = useLocation();

  // The footer's "Data protection" link opens this page at #privacy.
  useEffect(() => {
    if (!hash) return undefined;
    const timer = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 50);
    return () => window.clearTimeout(timer);
  }, [hash]);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:py-12">
      <header className="max-w-3xl">
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground md:text-[30px]">
          {t('about.title')}
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground md:text-[18px]">
          {t('about.mission')}
        </p>
      </header>

      <section className="mt-10 sm:mt-12" aria-labelledby="about-how">
        <h2
          id="about-how"
          className="text-[20px] font-semibold tracking-tight text-foreground md:text-[30px]"
        >
          {t('about.howTitle')}
        </h2>
        <ol className="mt-6 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => {
          const { key } = step;
          const Icon = step.Icon;
          return (
            <li
              key={key}
              className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] [overflow-wrap:anywhere]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius)] bg-primary/10 text-primary-text">
                  <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <p className="text-[12px] font-semibold uppercase leading-none tracking-[0.06em] text-muted-foreground">
                  {index + 1}
                </p>
              </div>
              <h3 className="mt-4 text-[17px] font-semibold text-foreground">{t(`about.${key}Title`)}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {t(`about.${key}Body`)}
              </p>
            </li>
          );
        })}
        </ol>
      </section>

      <section id="privacy" className="mt-10 scroll-mt-24 sm:mt-12" aria-labelledby="about-privacy">
        <h2
          id="about-privacy"
          className="text-[20px] font-semibold tracking-tight text-foreground md:text-[24px]"
        >
          {t('about.privacyTitle')}
        </h2>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          {t('about.privacyAiPhotos')}
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:mt-12 sm:p-8">
        <h2 className="text-[20px] font-semibold tracking-tight text-foreground md:text-[24px]">
          {t('about.contactTitle')}
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {t('about.contactBody')}
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="primary" className="w-full sm:w-auto">
            <Link to={withLang(ROUTES.add, language)}>{t('nav.addListing')}</Link>
          </Button>
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link to={withLang(ROUTES.add, language)}>{t('about.forDealers')}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
