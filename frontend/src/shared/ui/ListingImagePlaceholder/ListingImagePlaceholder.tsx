import { useEffect, useState } from 'react';

import { focusPosition } from '@/lib/imageFocus';

export const LISTING_IMAGE_PLACEHOLDER_SRC = '/icons/sedan-car-model-svgrepo-com.svg';

type PlaceholderProps = {
  className?: string;
  /** Size of the silhouette icon inside the frame. */
  iconClassName?: string;
};

/** Same empty-listing silhouette as the vehicle detail gallery (tokens only). */
export function ListingImagePlaceholder({
  className = '',
  iconClassName = 'h-24 w-24 opacity-20',
}: PlaceholderProps) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-card-muted ${className}`.trim()}
      aria-hidden="true"
    >
      <img src={LISTING_IMAGE_PLACEHOLDER_SRC} alt="" className={iconClassName} />
    </div>
  );
}

type ListingPhotoProps = {
  src?: string | null;
  className?: string;
  loading?: 'eager' | 'lazy';
  /** Decorative listing photos always use alt="". */
};

/** Listing photo with busted-URL fallback to the shared placeholder. */
export function ListingPhoto({ src, className = '', loading = 'lazy' }: ListingPhotoProps) {
  const [broken, setBroken] = useState(false);
  const safeSrc = typeof src === 'string' ? src.trim() : '';

  useEffect(() => {
    setBroken(false);
  }, [safeSrc]);

  if (!safeSrc || broken) {
    return <ListingImagePlaceholder className={className} iconClassName="h-20 w-20 opacity-20" />;
  }

  return (
    <img
      src={safeSrc}
      alt=""
      loading={loading}
      className={className}
      // The seller's chosen crop (see lib/imageFocus); the centre when none was set.
      style={{ objectPosition: focusPosition(safeSrc) }}
      onError={() => setBroken(true)}
    />
  );
}

export default ListingImagePlaceholder;
