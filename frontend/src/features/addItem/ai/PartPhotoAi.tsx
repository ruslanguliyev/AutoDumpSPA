import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { recognizePartPhoto, type PartPhotoResult } from '@/features/addItem/ai/partPhoto.api';
import { useAddItemStore } from '@/features/addItem/store/useAddItemStore';
import { aiErrorCode, type AiLanguageCode } from '@/features/ai/ai.api';
import { PHOTO_TYPES, PhotoError, preparePhoto } from '@/features/ai/chat/preparePhoto';
import { formatPartCategoryLabel } from '@/parts/utils/partCategoryLabel';
import { AiSparkle } from '@/shared/ui/AiSparkle/AiSparkle';
import Button from '@/shared/ui/button';

type Phase = 'idle' | 'working' | 'result' | 'notPart' | 'applied' | 'error';

const uiLanguage = (language: string): AiLanguageCode => {
  if (language.startsWith('en')) return 'EN';
  if (language.startsWith('ru')) return 'RU';
  return 'AZ';
};

const Spinner = () => (
  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M21 12a9 9 0 1 1-6.2-8.56" />
  </svg>
);

/**
 * "Fill with AI" for a part listing: the seller picks a photo of the part, the server says what
 * it is, and the seller reviews the suggested fields before anything lands in the form.
 * Condition and price are never suggested; the seller sets them.
 */
export function PartPhotoAi() {
  const { t, i18n } = useTranslation('addItem');
  const { t: tPart } = useTranslation('part');
  const setCommonField = useAddItemStore((state) => state.setCommonField);
  const setPartField = useAddItemStore((state) => state.setPartField);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [result, setResult] = useState<PartPhotoResult | null>(null);
  const [errorKey, setErrorKey] = useState('partAi.errorGeneric');

  useEffect(() => () => abortRef.current?.abort(), []);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setResult(null);
    setPhase('working');
    try {
      const photo = await preparePhoto(file);
      setThumbnail(photo.thumbnail);
      const found = await recognizePartPhoto(photo.blob, uiLanguage(i18n.language), controller.signal);
      if (controller.signal.aborted) return;
      setResult(found);
      setPhase(found.isCarPart ? 'result' : 'notPart');
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error instanceof PhotoError) {
        setErrorKey(error.reason === 'size' ? 'partAi.errorSize' : 'partAi.errorType');
      } else {
        const code = aiErrorCode(error);
        setErrorKey(
          code === 'RATE_LIMITED' || code === 'DAILY_LIMIT'
            ? 'partAi.errorRate'
            : code === 'INVALID_IMAGE'
              ? 'partAi.errorType'
              : code === 'UNAVAILABLE' || code === 'PAUSED'
                ? 'partAi.errorUnavailable'
                : 'partAi.errorGeneric',
        );
      }
      setPhase('error');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const apply = () => {
    if (!result) return;
    setPartField('name', result.name);
    if (result.category) setCommonField('category', result.category);
    if (result.brand) setPartField('brand', result.brand);
    if (result.partNumber) setPartField('partNumber', result.partNumber);
    if (result.compatibility.length) setPartField('compatibility', result.compatibility.join(', '));
    if (result.description) setCommonField('description', result.description);
    setPhase('applied');
  };

  const reset = () => {
    abortRef.current?.abort();
    setResult(null);
    setThumbnail(null);
    setPhase('idle');
  };

  const rows: Array<[string, string]> = result
    ? ([
        [t('form.partName'), result.name],
        [t('form.category'), result.category ? formatPartCategoryLabel(tPart, result.category) || result.category : ''],
        [t('form.brand'), result.brand],
        [t('form.partNumber'), result.partNumber],
        [t('form.compatibility'), result.compatibility.join(', ')],
        [t('form.description'), result.description],
      ] as Array<[string, string]>).filter(([, value]) => value)
    : [];

  return (
    <section className="rounded-xl border border-ai-border bg-ai-surface p-4" aria-labelledby="part-ai-title">
      <div className="flex flex-col gap-1">
        <h3 id="part-ai-title" className="flex items-center gap-2 text-[16px] font-semibold text-ai-text">
          <AiSparkle size={16} />
          {t('partAi.title')}
        </h3>
        <p className="text-[14px] text-muted-foreground">{t('partAi.hint')}</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={PHOTO_TYPES.join(',')}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => void pick(event.target.files?.[0])}
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {thumbnail && phase !== 'idle' ? (
          <img src={thumbnail} alt="" className="h-16 w-16 rounded-[var(--radius)] border border-border object-cover" />
        ) : null}
        {phase === 'working' ? (
          <span className="flex items-center gap-2 text-[14px] text-foreground" role="status">
            <Spinner />
            {t('partAi.working')}
          </span>
        ) : phase !== 'result' ? (
          <Button size="sm" onClick={() => inputRef.current?.click()}>
            <AiSparkle size={16} />
            {phase === 'idle' ? t('partAi.pick') : t('partAi.pickAnother')}
          </Button>
        ) : null}
      </div>

      {phase === 'notPart' ? (
        <p className="mt-3 text-[14px] text-foreground" role="status">{t('partAi.notPart')}</p>
      ) : null}
      {phase === 'error' ? (
        <p className="mt-3 rounded-[var(--radius)] bg-destructive/15 px-2.5 py-2 text-[13px] text-destructive" role="alert">
          {t(errorKey)}
        </p>
      ) : null}
      {phase === 'applied' ? (
        <p className="mt-3 text-[14px] text-foreground" role="status">{t('partAi.applied')}</p>
      ) : null}

      {phase === 'result' && result ? (
        <div className="mt-3 flex flex-col gap-3 [overflow-wrap:anywhere]">
          {result.confidence === 'low' ? (
            <p className="text-[13px] text-muted-foreground">{t('partAi.lowConfidence')}</p>
          ) : null}
          <dl className="flex flex-col gap-2 rounded-[var(--radius)] border border-border bg-background p-3 text-[14px]">
            {rows.map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                <dt className="shrink-0 text-muted-foreground sm:w-36">{label}</dt>
                <dd className="text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
          {!result.compatibility.length ? (
            <p className="text-[13px] text-muted-foreground">{t('partAi.noCompatibility')}</p>
          ) : !result.compatibilityConfirmed ? (
            <p className="text-[13px] text-warning">{t('partAi.compatibilityGuess')}</p>
          ) : null}
          <p className="text-[13px] text-muted-foreground">{t('partAi.sellerSets')}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={apply}>{t('partAi.apply')}</Button>
            <Button variant="ghost" size="sm" onClick={reset}>{t('partAi.cancel')}</Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
