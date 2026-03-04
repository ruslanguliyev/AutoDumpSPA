import { GraduationCap, Leaf, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SpecialistCertification } from '@/specialists/types/specialist.types';

type SpecialistCertificationsProps = {
  certifications: SpecialistCertification[];
};

const iconMap: Record<string, React.ReactNode> = {
  ase: <GraduationCap size={18} aria-hidden="true" />,
  ev: <Leaf size={18} aria-hidden="true" />,
  generic: <ShieldCheck size={18} aria-hidden="true" />,
};

const iconColorMap: Record<string, string> = {
  ase: 'bg-warning/10 text-warning',
  ev: 'bg-success/10 text-success',
  generic: 'bg-primary/10 text-primary',
};

const SpecialistCertifications = ({ certifications }: SpecialistCertificationsProps) => {
  const { t } = useTranslation('specialists');

  if (!certifications.length) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow)] sm:p-6">
      <h2 className="text-base font-semibold text-foreground">{t('detail.certifications')}</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {certifications.map((cert) => {
          const code = cert.iconCode ?? 'generic';
          const icon = iconMap[code] ?? iconMap.generic;
          const colorClass = iconColorMap[code] ?? iconColorMap.generic;

          return (
            <div
              key={cert.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3"
            >
              <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                {icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{cert.title}</p>
                {cert.subtitle ? (
                  <p className="text-xs text-muted-foreground">{cert.subtitle}</p>
                ) : null}
                {cert.validUntil ? (
                  <p className="text-xs text-muted-foreground">
                    {t('detail.validUntil', { date: cert.validUntil })}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SpecialistCertifications;
