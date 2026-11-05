import { useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { useAddItemStore } from '@/features/addItem/store/useAddItemStore';
import { getApiBase, normalizeUploadUrl, resolveMediaUrl } from '@/lib/mediaUrl';
import Button from '@/shared/ui/button';

const inputClass =
  'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

type PendingUpload = {
  id: string;
  localUrl: string;
  name: string;
};

const createPendingId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `pending_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const PhotosStep = () => {
  const { t } = useTranslation('addItem');
  const draft = useAddItemStore((state) => state.draft);
  const setMediaField = useAddItemStore((state) => state.setMediaField);
  const addImage = useAddItemStore((state) => state.addImage);
  const removeImage = useAddItemStore((state) => state.removeImage);
  const setMainImage = useAddItemStore((state) => state.setMainImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlError, setUrlError] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [pending, setPending] = useState<PendingUpload[]>([]);

  if (!draft) return null;

  const isValidHttpUrl = (value: string) => {
    try {
      const u = new URL(value);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const addUrlImage = () => {
    const normalized = draft.media.pendingUrl.trim();
    if (!normalized) {
      setUrlError(t('validation.required'));
      return;
    }
    if (!isValidHttpUrl(normalized)) {
      setUrlError(t('errors.uploadFailed'));
      return;
    }
    setUrlError('');
    setUploadError('');
    addImage(normalized);
    setMediaField('pendingUrl', '');
  };

  const uploadOneFile = async (file: File, position: number): Promise<string> => {
    const listingId = draft._listingId ?? draft.id;
    const token =
      typeof window === 'undefined' ? null : window.localStorage.getItem('autobaz-token');
    if (!token || !listingId) {
      throw new Error(t('errors.uploadFailed'));
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(
      `${getApiBase()}/uploads/${encodeURIComponent(listingId)}?position=${position}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );
    if (!res.ok) throw new Error(t('errors.uploadFailed'));

    const data = (await res.json()) as { url?: string };
    if (!data.url) throw new Error(t('errors.uploadFailed'));
    return normalizeUploadUrl(data.url);
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;

    setUploadError('');
    setUrlError('');

    const startPosition = draft.media.images.length;
    const newPendings: PendingUpload[] = files.map((file) => ({
      id: createPendingId(),
      localUrl: URL.createObjectURL(file),
      name: file.name,
    }));
    setPending((p) => [...p, ...newPendings]);

    await Promise.all(
      files.map(async (file, index) => {
        const entry = newPendings[index];
        try {
          const uploadedUrl = await uploadOneFile(file, startPosition + index);
          addImage(uploadedUrl);
        } catch {
          setUploadError(t('errors.uploadFailed'));
        } finally {
          URL.revokeObjectURL(entry.localUrl);
          setPending((p) => p.filter((x) => x.id !== entry.id));
        }
      })
    );
  };

  const handleAddClick = () => {
    if (draft.media.pendingUrl.trim()) {
      addUrlImage();
      return;
    }
    fileInputRef.current?.click();
  };

  const uploading = pending.length > 0;

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
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          className={inputClass}
          placeholder={t('form.pasteImageUrl')}
          value={draft.media.pendingUrl}
          onChange={(event) => {
            setMediaField('pendingUrl', event.target.value);
            if (urlError) setUrlError('');
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addUrlImage();
            }
          }}
        />
        <Button onClick={handleAddClick} disabled={uploading}>
          {uploading ? t('buttons.saving') : t('buttons.addPhoto')}
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{t('form.publicImageHint')}</p>
      {urlError ? (
        <p className="mt-2 text-xs text-destructive">{urlError}</p>
      ) : null}
      {uploadError ? (
        <p className="mt-2 text-xs text-destructive">{uploadError}</p>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {draft.media.images.length === 0 && pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            {t('form.noImagesYet')}
          </div>
        ) : (
          <>
            {draft.media.images.map((image) => {
              const displayUrl = resolveMediaUrl(image.url);
              return (
                <div key={image.id} className="rounded-xl border border-border bg-background p-3">
                  <div
                    className="relative overflow-hidden rounded-lg border border-border bg-muted"
                    onClick={() => setMainImage(image.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setMainImage(image.id);
                      }
                    }}
                  >
                    <button
                      type="button"
                      className="absolute right-2 top-2 z-10 h-6 w-6 rounded-full bg-background/90 text-sm leading-none text-foreground hover:bg-background"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeImage(image.id);
                      }}
                      aria-label={t('buttons.remove')}
                    >
                      ×
                    </button>
                    {displayUrl ? (
                      <img
                        src={displayUrl}
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
                      <Button variant="ghost" size="sm" onClick={() => removeImage(image.id)}>
                        {t('buttons.remove')}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {pending.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-border bg-background p-3 opacity-80">
                <div className="relative overflow-hidden rounded-lg border border-border bg-muted">
                  <img
                    src={entry.localUrl}
                    alt={entry.name}
                    className="h-36 w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-background/40 text-xs font-medium text-foreground">
                    {t('buttons.saving')}
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">{entry.name}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default PhotosStep;
