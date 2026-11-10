import { BadgeCheck, MapPin, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatNumber, intlLocale } from '@/lib/format';
import { ProfileHeader, ShareButton } from '@/shared/blocks';
import type { ProfileHeaderMetaItem } from '@/shared/blocks';
import { Badge } from '@/shared/ui/Badge';
import { Chip } from '@/shared/ui/Chip';
import { ListingPhoto } from '@/shared/ui/ListingImagePlaceholder';
import type { SpecialistDetail } from '@/specialists/types/specialist.types';

type SpecialistHeroProps = {
  specialist: SpecialistDetail;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || '??';
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
      verified={specialist.verified ? <Badge variant="verified">{t('card.verified')}</Badge> : null}
      cover={
        <div className="h-32 w-full sm:h-40 lg:h-48">
          {banner ? (
            <ListingPhoto src={banner} className="h-full w-full object-cover" loading="eager" />
          ) : null}
        </div>
      }
      avatar={
        <div className="relative">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-card bg-card-muted sm:h-28 sm:w-28">
            {avatar ? (
              <ListingPhoto src={avatar} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[18px] font-semibold text-muted-foreground">
                {getInitials(specialist.name)}
              </span>
            )}
          </div>
          {specialist.verified ? (
            <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-success text-primary-foreground">
              <BadgeCheck size={14} aria-hidden="true" />
            </span>
          ) : null}
        </div>
      }
      rating={{ rating: specialist.rating, reviewsCount: specialist.reviewsCount }}
      meta={meta}
      tags={
        specializations.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {specializations.map((item) => (
              <Chip key={item}>{t(`specializations.${item}`, { defaultValue: item })}</Chip>
            ))}
          </div>
        ) : null
      }
      actions={<ShareButton title={specialist.name} />}
    />
  );
};

export default SpecialistHero;
