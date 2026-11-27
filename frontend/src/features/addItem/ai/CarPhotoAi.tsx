import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { toCarFill, type CarFill } from '@/features/addItem/ai/carFill';
import { recognizeCarPhoto } from '@/features/addItem/ai/partPhoto.api';
import { useAddItemStore } from '@/features/addItem/store/useAddItemStore';
import { aiErrorCode, type AiLanguageCode } from '@/features/ai/ai.api';
import { PHOTO_TYPES, PhotoError, preparePhoto } from '@/features/ai/chat/preparePhoto';
import { AiSparkle } from '@/shared/ui/AiSparkle/AiSparkle';
import Button from '@/shared/ui/button';

type Phase = 'idle' | 'working' | 'result' | 'notCar' | 'applied' | 'error';

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
 * "Fill with AI" for a car listing (sale or rent): the seller picks a photo of the car, the
 * server says what it is, and the seller reviews the suggested fields before anything lands in
 * the form. Values come only from the wizard's own lists; guesses are marked for checking.
 * Price, mileage, condition, VIN and plate are never suggested.
 */
export function CarPhotoAi() {
  const { t, i18n } = useTranslation('addItem');
  const setCommonField = useAddItemStore((state) => state.setCommonField);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [fill, setFill] = useState<CarFill | null>(null);
  const [lowConfidence, setLowConfidence] = useState(false);
  const [errorKey, setErrorKey] = useState('carAi.errorGeneric');

  useEffect(() => () => abortRef.current?.abort(), []);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setFill(null);
    setPhase('working');
    try {
      const photo = await preparePhoto(file);
      setThumbnail(photo.thumbnail);
      const found = await recognizeCarPhoto(photo.blob, uiLanguage(i18n.language), controller.signal);
      if (controller.signal.aborted) return;
      const narrowed = toCarFill(found);
      setLowConfidence(found.confidence === 'low');
      setFill(narrowed);
      const anything = narrowed.brand || narrowed.bodyType || narrowed.description;
      setPhase(found.isCar && anything ? 'result' : 'notCar');
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error instanceof PhotoError) {
        setErrorKey(error.reason === 'size' ? 'carAi.errorSize' : 'carAi.errorType');
      } else {
        const code = aiErrorCode(error);
        setErrorKey(
          code === 'RATE_LIMITED' || code === 'DAILY_LIMIT'
            ? 'carAi.errorRate'
            : code === 'INVALID_IMAGE'
              ? 'carAi.errorType'
              : code === 'UNAVAILABLE' || code === 'PAUSED'
                ? 'carAi.errorUnavailable'
                : 'carAi.errorGeneric',
        );
      }
      setPhase('error');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const apply = () => {
    if (!fill) return;
    if (fill.bodyType) setCommonField('category', fill.bodyType);
    if (fill.description) setCommonField('description', fill.description);
    // One update, so a changed make clears the old model's trim and generation together.
    useAddItemStore.setState((state) => {
      const vehicle = state.draft?.vehicle;
      if (!state.draft || !vehicle) return {};
      const carChanged = Boolean(fill.brand) && (fill.brand !== vehicle.brand || (fill.model && fill.model !== vehicle.model));
      return {
        draft: {
          ...state.draft,
          vehicle: {
            ...vehicle,
            ...(fill.brand ? { brand: fill.brand, model: fill.model } : {}),
            ...(carChanged ? { trim: '', generation: '' } : {}),
            ...(fill.year ? { year: fill.year } : {}),
            ...(fill.fuel ? { fuel: fill.fuel } : {}),
            ...(fill.transmission ? { transmission: fill.transmission } : {}),
            ...(fill.drivetrain ? { drivetrain: fill.drivetrain } : {}),
          },
        },
        dirty: true,
        saveStatus: 'idle' as const,
      };
    });
    setPhase('applied');
  };

  const reset = () => {
    abortRef.current?.abort();
    setFill(null);
    setThumbnail(null);
    setPhase('idle');
  };

  const years =
    fill && !fill.year && (fill.yearFrom || fill.yearTo)
      ? fill.yearFrom && fill.yearTo && fill.yearFrom !== fill.yearTo
        ? `${fill.yearFrom}–${fill.yearTo}`
        : String(fill.yearFrom ?? fill.yearTo)
      : '';

  const rows: Array<{ label: string; value: string; guess: boolean; hint?: string }> = fill
    ? [
        { label: t('form.brand'), value: fill.brand, guess: false },
        { label: t('form.model'), value: fill.model, guess: fill.likely.includes('model') },
        {
          label: t('form.year'),
          value: fill.year || years,
          guess: fill.likely.includes('years'),
          hint: years ? t('carAi.yearsHint') : undefined,
        },
        {
          label: t('form.category'),
          value: fill.bodyType ? t(`form.vehicleCategories.${fill.bodyType}`) : '',
          guess: fill.likely.includes('bodyType'),
        },
        { label: t('form.fuel'), value: fill.fuel ? t(`vehicleForm.fuel.${fill.fuel}`) : '', guess: fill.likely.includes('fuel') },
        {
          label: t('form.transmission'),
          value: fill.transmission ? t(`vehicleForm.transmission.${fill.transmission}`) : '',
          guess: fill.likely.includes('transmission'),
        },
        {
          label: t('form.drivetrain'),
          value: fill.drivetrain ? t(`vehicleForm.drivetrain.${fill.drivetrain}`) : '',
          guess: fill.likely.includes('drivetrain'),
        },
        { label: t('form.description'), value: fill.description, guess: false },
      ].filter((row) => row.value)
    : [];
  const anyGuess = rows.some((row) => row.guess);

  return (
    <section className="rounded-xl border border-ai-border bg-ai-surface p-4" aria-labelledby="car-ai-title">
      <div className="flex flex-col gap-1">
        <h3 id="car-ai-title" className="flex items-center gap-2 text-[16px] font-semibold text-ai-text">
          <AiSparkle size={16} />
          {t('carAi.title')}
        </h3>
        <p className="text-[14px] text-muted-foreground">{t('carAi.hint')}</p>
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
            {t('carAi.working')}
          </span>
        ) : phase !== 'result' ? (
          <Button size="sm" className="!h-11" onClick={() => inputRef.current?.click()}>
            <AiSparkle size={16} />
            {phase === 'idle' ? t('carAi.pick') : t('carAi.pickAnother')}
          </Button>
        ) : null}
      </div>

      {phase === 'notCar' ? (
        <p className="mt-3 text-[14px] text-foreground" role="status">{t('carAi.notCar')}</p>
      ) : null}
      {phase === 'error' ? (
        <p className="mt-3 rounded-[var(--radius)] bg-destructive/15 px-2.5 py-2 text-[13px] text-destructive" role="alert">
          {t(errorKey)}
        </p>
      ) : null}
      {phase === 'applied' ? (
        <p className="mt-3 text-[14px] text-foreground" role="status">{t('carAi.applied')}</p>
      ) : null}

      {phase === 'result' && fill ? (
        <div className="mt-3 flex flex-col gap-3 [overflow-wrap:anywhere]">
          {lowConfidence ? <p className="text-[13px] text-muted-foreground">{t('carAi.lowConfidence')}</p> : null}
          <dl className="flex flex-col gap-2 rounded-[var(--radius)] border border-border bg-background p-3 text-[14px]">
            {rows.map((row) => (
              <div key={row.label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                <dt className="shrink-0 text-muted-foreground sm:w-36">{row.label}</dt>
                <dd className="flex flex-col gap-0.5 text-foreground">
                  <span>
                    {row.value}
                    {row.guess ? (
                      <span className="ml-2 rounded-full bg-warning/15 px-2 py-0.5 text-[12px] text-warning">
                        {t('carAi.check')}
                      </span>
                    ) : null}
                  </span>
                  {row.hint ? <span className="text-[13px] text-muted-foreground">{row.hint}</span> : null}
                </dd>
              </div>
            ))}
          </dl>
          {fill.brand && !fill.model ? <p className="text-[13px] text-muted-foreground">{t('carAi.noModel')}</p> : null}
          {anyGuess ? <p className="text-[13px] text-warning">{t('carAi.guessNote')}</p> : null}
          <p className="text-[13px] text-muted-foreground">{t('carAi.sellerSets')}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="!h-11" onClick={apply}>{t('carAi.apply')}</Button>
            <Button variant="ghost" size="sm" className="!h-11" onClick={reset}>{t('carAi.cancel')}</Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
