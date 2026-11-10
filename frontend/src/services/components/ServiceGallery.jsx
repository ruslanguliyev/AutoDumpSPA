import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import MediaCarousel from '@/shared/ui/MediaCarousel/MediaCarousel';

export default function ServiceGallery({ media, serviceName, serviceId }) {
  const { t } = useTranslation('services');

  const items = useMemo(() => {
    const urls = [media?.cover, ...(media?.gallery ?? [])].filter(Boolean);
    return urls.map((src, index) => ({
      id: `${serviceId ?? 'service'}-${index}`,
      src,
      alt: '',
      type: 'image',
    }));
  }, [media, serviceId]);

  if (!items.length) return null;

  return (
    <MediaCarousel
      items={items}
      ariaLabel={t('detail.galleryAria', { name: serviceName })}
      viewportClassName="aspect-video rounded-2xl bg-card-muted"
      mediaClassName="object-cover"
      showCounter={items.length > 1}
    />
  );
}
