import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatPlace } from '@/lib/format';
import { formatServiceTypeLabel } from '@/services/utils/serviceTypeLabel';
import { ProfileHeader, ShareButton } from '@/shared/blocks';
import { Badge } from '@/shared/ui/Badge';
import { Chip } from '@/shared/ui/Chip';

export default function ServiceHeader({ service, reviewsCount, ratingValue }) {
  const { t } = useTranslation(['services', 'common']);
  const typeLabel = formatServiceTypeLabel(t, service.type);
  const place = formatPlace(service.location?.address, service.location?.city);
  const logo = service.media?.logo || null;
  const coverSrc = service.media?.cover || null;

  return (
    <ProfileHeader
      name={service.name}
      coverSrc={coverSrc}
      avatarSrc={logo}
      verified={Boolean(service.verified)}
      verifiedBadge={service.verified ? <Badge variant="verified">{t('header.verified')}</Badge> : null}
      rating={{ rating: ratingValue, reviewsCount }}
      meta={
        place
          ? [{ icon: <MapPin size={16} strokeWidth={1.5} aria-hidden="true" />, text: place }]
          : []
      }
      tags={typeLabel ? <Chip>{typeLabel}</Chip> : null}
      actions={<ShareButton title={service.name} />}
    />
  );
}
