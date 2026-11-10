import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatPlace } from '@/lib/format';
import { ProfileHeader, ShareButton } from '@/shared/blocks';
import { Badge } from '@/shared/ui/Badge';
import { ListingPhoto } from '@/shared/ui/ListingImagePlaceholder';
import { formatServiceTypeLabel } from '@/services/utils/serviceTypeLabel';

export default function ServiceHeader({ service, reviewsCount, ratingValue }) {
  const { t } = useTranslation(['services', 'common']);
  const typeLabel = formatServiceTypeLabel(t, service.type);
  const place = formatPlace(service.location?.address, service.location?.city);
  const logo = service.media?.logo || null;
  const coverSrc = service.media?.cover || null;

  return (
    <ProfileHeader
      name={service.name}
      verified={service.verified ? <Badge variant="verified">{t('header.verified')}</Badge> : null}
      subtitle={typeLabel || null}
      cover={
        coverSrc ? (
          <div className="relative aspect-[3/1] max-h-40 w-full">
            <ListingPhoto src={coverSrc} className="h-full w-full object-cover" loading="eager" />
          </div>
        ) : null
      }
      avatar={
        logo ? (
          <ListingPhoto
            src={logo}
            className="h-14 w-14 rounded-xl border border-border object-cover"
          />
        ) : null
      }
      rating={{ rating: ratingValue, reviewsCount }}
      meta={
        place
          ? [{ icon: <MapPin size={16} strokeWidth={1.5} aria-hidden="true" />, text: place }]
          : []
      }
      actions={<ShareButton title={service.name} />}
    />
  );
}
