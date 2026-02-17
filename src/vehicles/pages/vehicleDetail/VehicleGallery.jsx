import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";

const MediaCarousel = lazy(() =>
  import("@/shared/ui/MediaCarousel/MediaCarousel")
);

const VehicleGallery = ({ items, ariaLabel }) => {
  const { t } = useTranslation("vehicle");
  return (
    <Suspense fallback={<div>{t("gallery.loadingImages")}</div>}>
      <MediaCarousel items={items} ariaLabel={ariaLabel} />
    </Suspense>
  );
};

export default VehicleGallery;
