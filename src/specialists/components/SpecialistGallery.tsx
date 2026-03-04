type SpecialistGalleryProps = {
  portfolio: string[];
  altPrefix: string;
};

const SpecialistGallery = ({ portfolio, altPrefix }: SpecialistGalleryProps) => {
  if (!portfolio.length) return null;

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
      role="list"
      aria-label="Portfolio gallery"
    >
      {portfolio.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className="overflow-hidden rounded-xl border border-border bg-muted shadow-[0_1px_2px_rgb(15_23_42_/_0.05)]"
          role="listitem"
        >
          <img
            src={src}
            alt={`${altPrefix} ${index + 1}`}
            className="h-32 w-full object-cover sm:h-36 lg:h-40"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
};

export default SpecialistGallery;
