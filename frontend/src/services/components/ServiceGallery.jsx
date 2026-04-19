export default function ServiceGallery({ media, serviceName }) {
  if (!media?.cover) return null;

  return (
    <section className="service-detail-page__gallery">
      <img src={media.cover} alt={serviceName} />
      {media.gallery && media.gallery.length > 0 && (
        <button type="button" className="gallery-button">
          View Gallery ({media.gallery.length + 1})
        </button>
      )}
    </section>
  );
}
