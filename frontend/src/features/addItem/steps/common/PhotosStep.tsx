import { useTranslation } from 'react-i18next';

import { useAddItemStore } from '@/features/addItem/store/useAddItemStore';
import Button from '@/shared/ui/button';

const inputClass =
  'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const PhotosStep = () => {
  const { t } = useTranslation('addItem');
  const draft = useAddItemStore((state) => state.draft);
  const setMediaField = useAddItemStore((state) => state.setMediaField);
  const addImage = useAddItemStore((state) => state.addImage);
  const removeImage = useAddItemStore((state) => state.removeImage);
  const setMainImage = useAddItemStore((state) => state.setMainImage);

  if (!draft) return null;

  const handleAdd = () => {
    if (!draft.media.pendingUrl.trim()) return;
    addImage(draft.media.pendingUrl);
    setMediaField('pendingUrl', '');
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t('form.photosTitle')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('form.photosHint')}
          </p>
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          {t('form.imagesCount', { count: draft.media.images.length })}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className={inputClass}
          placeholder={t('form.pasteImageUrl')}
          value={draft.media.pendingUrl}
          onChange={(event) => setMediaField('pendingUrl', event.target.value)}
        />
        <Button onClick={handleAdd}>{t('buttons.addPhoto')}</Button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {draft.media.images.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            {t('form.noImagesYet')}
          </div>
        ) : (
          draft.media.images.map((image) => (
            <div
              key={image.id}
              className="rounded-xl border border-border bg-background p-3"
            >
              <div className="overflow-hidden rounded-lg border border-border bg-muted">
                {image.url ? (
                  <img
                    src={image.url}
                    alt={t('form.draftUploadAlt')}
                    className="h-36 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-36 items-center justify-center text-xs text-muted-foreground">
                    {t('form.missingUrl')}
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {image.isMain ? t('form.mainImage') : t('form.galleryImage')}
                </span>
                <div className="flex items-center gap-2">
                  {!image.isMain && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMainImage(image.id)}
                    >
                      {t('buttons.setMain')}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImage(image.id)}
                  >
                    {t('buttons.remove')}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PhotosStep;
