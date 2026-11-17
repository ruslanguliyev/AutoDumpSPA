import { MapPin, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatNumber, intlLocale } from '@/lib/format';
import { ProfileHeader, ShareButton } from '@/shared/blocks';
import type { ProfileHeaderMetaItem } from '@/shared/blocks';
import { Badge } from '@/shared/ui/Badge';
import { Chip } from '@/shared/ui/Chip';
import type { SpecialistDetail } from '@/specialists/types/specialist.types';

type SpecialistHeroProps = {
  specialist: SpecialistDetail;
};

const SpecialistHero = ({ specialist }: SpecialistHeroProps) => {
  const { t, i18n } = useTranslation(['specialists', 'common']);
  const locale = intlLocale(i18n.language);

  const yearsExperienceValue = Number.isFinite(specialist.yearsExperience)
    ? Number(specialist.yearsExperience)
    : Number.isFinite(specialist.experienceYears)
      ? Number(specialist.experienceYears)
      : null;
  const specializations = specialist.specializations ?? [];
  const locationLabel = specialist.location ?? null;
  const banner = specialist.banner ?? specialist.coverImage ?? null;
  const avatar = specialist.avatar ?? specialist.avatarUrl ?? null;

  const meta: ProfileHeaderMetaItem[] = [];
  if (yearsExperienceValue !== null) {
    meta.push({
      icon: <User size={16} strokeWidth={1.5} aria-hidden="true" />,
      text: `${formatNumber(yearsExperienceValue, locale)} ${t('detail.yearsExp')}`,
    });
  }
  if (locationLabel) {
    meta.push({
      icon: <MapPin size={16} strokeWidth={1.5} aria-hidden="true" />,
      text: locationLabel,
    });
  }

  return (
    <ProfileHeader
      name={specialist.name}
      coverSrc={banner}
      avatarSrc={avatar}
      verified={Boolean(specialist.verified)}
      verifiedBadge={specialist.verified ? <Badge variant="verified">{t('card.verified')}</Badge> : null}
      rating={{ rating: specialist.rating, reviewsCount: specialist.reviewsCount }}
      viewsCount={specialist.viewsCount}
      meta={meta}
      tags={
        specializations.length > 0
          ? specializations.map((item) => (
              <Chip key={item}>{t(`specializations.${item}`, { defaultValue: item })}</Chip>
            ))
          : null
      }
      actions={<ShareButton title={specialist.name} />}
    />
  );
};

export default SpecialistHero;
