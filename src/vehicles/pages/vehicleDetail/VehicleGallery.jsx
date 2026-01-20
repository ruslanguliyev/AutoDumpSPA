import { lazy, Suspense } from "react";

const MediaCarousel = lazy(() =>
  import("@/shared/ui/MediaCarousel/MediaCarousel")
);

const VehicleGallery = ({ items, ariaLabel }) => {
  return (
    <Suspense fallback={<div>Loading images…</div>}>
      <MediaCarousel items={items} ariaLabel={ariaLabel} />
    </Suspense>
  );
};

export default VehicleGallery;
