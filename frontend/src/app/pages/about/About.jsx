import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import Button from '@/shared/ui/button';

const STEPS = ['step1', 'step2', 'step3', 'step4'];

export default function About() {
  const { t } = useTranslation('common');
  useDocumentTitle(t('about.title'));

  return (
    <div className="mx-auto w-full max-w-[800px] px-4 py-8 sm:py-10">
      <h1 className="text-[22px] font-semibold tracking-tight text-foreground md:text-[26px]">
        {t('about.title')}
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{t('about.mission')}</p>

      <h2 className="mt-10 text-[17px] font-semibold text-foreground">{t('about.howTitle')}</h2>
      <ol className="mt-4 grid gap-3">
        {STEPS.map((step, index) => (
          <li
            key={step}
            className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
          >
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {index + 1}
            </p>
            <h3 className="mt-1 text-[15px] font-semibold text-foreground">
              {t(`about.${step}Title`)}
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              {t(`about.${step}Body`)}
            </p>
          </li>
        ))}
      </ol>

      <section className="mt-10 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <h2 className="text-[17px] font-semibold text-foreground">{t('about.contactTitle')}</h2>
        <p className="mt-2 text-[15px] text-muted-foreground">{t('about.contactBody')}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button asChild className="min-h-11">
            <Link to="/">{t('common.goHome')}</Link>
          </Button>
          <Button asChild variant="secondary" className="min-h-11">
            <Link to="/add">{t('about.forDealers')}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
