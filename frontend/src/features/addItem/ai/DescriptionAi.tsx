import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { setDescriptionLeaveGuard } from '@/features/addItem/ai/descriptionLeaveGuard';
import { buildSteps } from '@/features/addItem/utils/buildSteps';
import { parseEngineVolume, parsePower } from '@/features/addItem/utils/validateDraft';
import { useAddItemStore } from '@/features/addItem/store/useAddItemStore';
import {
  aiErrorCode,
  generateListingDescription,
  useAiEnabled,
  type AiErrorCode,
  type AiLanguageCode,
  type DescriptionMode,
  type DescriptionTone,
} from '@/features/ai/ai.api';
import { AiSparkle } from '@/shared/ui/AiSparkle/AiSparkle';
import Button from '@/shared/ui/button';
import Skeleton from '@/shared/ui/Skeleton/Skeleton';
import { cn } from '@/shared/utils/cn';

const DESCRIPTION_MAX = 2000;
const BRACKETS = /\[[^\]\n]+\]/;

const uiLanguage = (language: string): AiLanguageCode => {
  if (language.startsWith('en')) return 'EN';
  if (language.startsWith('ru')) return 'RU';
  return 'AZ';
};

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 9 9" strokeLinecap="round" />
    </svg>
  );
}

function Segment<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex h-10 overflow-x-auto rounded-[var(--radius)] border border-border text-[13px]">
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex h-10 shrink-0 items-center px-3.5',
              focusRing,
              index > 0 && 'border-l border-border',
              selected ? 'bg-card-muted font-semibold text-foreground' : 'text-muted-foreground',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * AI draft controls for the vehicle description. Renders nothing when the
 * server reports that AI is off, so the plain textarea stays in charge.
 */
export function DescriptionAi() {
  const { t, i18n } = useTranslation('addItem');
  const enabled = useAiEnabled();
  const draft = useAddItemStore((state) => state.draft);
  const setCommonField = useAddItemStore((state) => state.setCommonField);
  const setStepIndex = useAddItemStore((state) => state.setStepIndex);

  const [tone, setTone] = useState<DescriptionTone>('NEUTRAL');
  const [language, setLanguage] = useState<AiLanguageCode>(() => uiLanguage(i18n.language));
  const [phase, setPhase] = useState<'idle' | 'generating' | 'error'>('idle');
  const [errorCode, setErrorCode] = useState<AiErrorCode>('GENERIC');
  const [snapshot, setSnapshot] = useState('');
  const [usedFields, setUsedFields] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [bracketOpen, setBracketOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const lastMode = useRef<DescriptionMode>('GENERATE');
  const proceedRef = useRef<(() => void) | null>(null);

  const description = draft?.common.description ?? '';
  const vehicle = draft?.type === 'vehicle' ? draft.vehicle : undefined;
  const year = Number(vehicle?.year);
  const canGenerate = Boolean(vehicle?.brand?.trim() && vehicle?.model?.trim() && Number.isInteger(year) && year > 0);
  const untouched = snapshot !== '' && description === snapshot;
  const vehicleStep = t('steps.vehicle');

  useEffect(() => {
    if (!enabled) {
      setDescriptionLeaveGuard(null);
      return;
    }
    setDescriptionLeaveGuard((proceed) => {
      if (BRACKETS.test(description)) {
        proceedRef.current = proceed;
        setBracketOpen(true);
        return;
      }
      proceed();
    });
    return () => setDescriptionLeaveGuard(null);
  }, [description, enabled]);

  if (!enabled || !draft || draft.type !== 'vehicle') return null;

  const goToVehicle = () => {
    const index = buildSteps(draft).findIndex((step) => step.id === 'vehicle');
    if (index >= 0) setStepIndex(index);
  };

  const run = async (mode: DescriptionMode) => {
    if (!vehicle || !canGenerate) return;
    lastMode.current = mode;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setPhase('generating');
    setConfirming(false);
    setErrorCode('GENERIC');
    const mileage = Number(String(vehicle.mileage ?? '').replace(/\s/g, ''));
    const engineVolume = parseEngineVolume(vehicle.displacement);
    const horsepower = parsePower(vehicle.horsepower);
    try {
      const result = await generateListingDescription(
        {
          brand: vehicle.brand.trim(),
          model: vehicle.model.trim(),
          generation: vehicle.generation.trim() || undefined,
          trim: vehicle.trim.trim() || undefined,
          year,
          mileage: Number.isInteger(mileage) && mileage >= 0 ? mileage : undefined,
          engineVolume,
          horsepower,
          transmission: vehicle.transmission.trim() || undefined,
          fuel: vehicle.fuel.trim() || undefined,
          bodyType: draft.common.category.trim() || undefined,
          condition: draft.common.condition || undefined,
          city: draft.seller.location.trim() || undefined,
          currentText: description.trim() || undefined,
          tone,
          language,
          mode,
        },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      const text = result?.text ?? '';
      setCommonField('description', text);
      setSnapshot(text);
      setUsedFields(result?.usedFields ?? []);
      setPhase('idle');
    } catch (error) {
      if (controller.signal.aborted) return;
      setErrorCode(aiErrorCode(error));
      setPhase('error');
    }
  };

  const askGenerate = () => {
    if (description.trim() && !untouched) {
      setConfirming(true);
      return;
    }
    void run('GENERATE');
  };

  const errorText =
    errorCode === 'RATE_LIMITED'
      ? t('ai.errorRate')
      : errorCode === 'UNAVAILABLE'
        ? t('ai.errorUnavailable')
        : t('ai.errorGeneric');

  const tones: Array<{ value: DescriptionTone; label: string }> = [
    { value: 'NEUTRAL', label: t('ai.toneNeutral') },
    { value: 'SALES', label: t('ai.toneSales') },
    { value: 'SHORT', label: t('ai.toneShort') },
  ];
  const languages: Array<{ value: AiLanguageCode; label: string }> = [
    { value: 'RU', label: 'RU' },
    { value: 'AZ', label: 'AZ' },
    { value: 'EN', label: 'EN' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="listing-description" className="text-[18px] font-semibold text-foreground">
          {t('form.description')}
        </label>
        <p className="text-[14px] text-muted-foreground">{t('ai.hint')}</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <Button
          className={cn(
            'w-full !h-12 sm:w-auto sm:!h-10',
            phase === 'generating' && '!border-ai-border !bg-ai-surface !text-ai-text disabled:!opacity-100',
            phase === 'error' && '!border-primary !bg-transparent !text-primary-text',
            !canGenerate && phase === 'idle' && '!border-border !bg-card-muted !text-subtle-foreground disabled:!opacity-100',
          )}
          disabled={!canGenerate || phase === 'generating'}
          aria-busy={phase === 'generating'}
          onClick={() => (phase === 'error' ? void run(lastMode.current) : askGenerate())}
        >
          {phase === 'generating' ? <Spinner /> : <AiSparkle size={16} />}
          {phase === 'generating' ? t('ai.writing') : phase === 'error' ? t('ai.retry') : t('ai.generate')}
        </Button>
        <div className="flex gap-2 overflow-x-auto sm:contents">
          <Segment<DescriptionTone> label={t('ai.toneLabel')} value={tone} options={tones} onChange={setTone} />
          <div className="sm:ml-auto">
            <Segment<AiLanguageCode> label={t('ai.languageLabel')} value={language} options={languages} onChange={setLanguage} />
          </div>
        </div>
      </div>

      <div aria-live="polite">
        {confirming ? (
          <div className="flex flex-wrap items-center gap-2 text-[14px]">
            <span>{t('ai.replaceTitle')}</span>
            <Button size="sm" className="!h-10" onClick={() => void run('GENERATE')}>
              {t('ai.replaceConfirm')}
            </Button>
            <Button variant="ghost" size="sm" className="!h-10" onClick={() => setConfirming(false)}>
              {t('ai.replaceCancel')}
            </Button>
          </div>
        ) : null}
        {!canGenerate && description.trim() ? (
          <p className="text-[14px] text-muted-foreground">
            {t('ai.needFacts')}{' '}
            <button type="button" className={cn('text-primary-text underline-offset-2 hover:underline', focusRing)} onClick={goToVehicle}>
              {t('ai.toStep', { step: vehicleStep })}
            </button>
          </p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-background">
        {untouched && phase !== 'generating' ? (
          <div className="flex flex-col gap-2 border-b border-ai-border bg-ai-surface px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:px-3.5">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-ai-text">
              <AiSparkle size={14} />
              <span className="sm:hidden">{t('ai.draftTitleMobile')}</span>
              <span className="hidden sm:inline">{t('ai.draftTitle')}</span>
            </div>
            <span className="hidden text-[13px] text-muted-foreground sm:inline">{t('ai.draftHint')}</span>
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              {(
                [
                  ['REGENERATE', t('ai.regenerate')],
                  ['SHORTER', t('ai.shorter')],
                  ['LONGER', t('ai.longer')],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  className={cn(
                    'inline-flex h-10 items-center rounded-[var(--radius)] border border-ai-border bg-transparent px-3 text-[13px] font-medium text-ai-text-soft',
                    focusRing,
                  )}
                  onClick={() => void run(mode)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {phase === 'generating' ? (
          <div className="flex h-[150px] flex-col gap-2.5 p-4">
            <Skeleton className="h-2.5 w-[96%] rounded-full bg-card-muted" />
            <Skeleton className="h-2.5 w-[88%] rounded-full bg-card-muted" />
            <Skeleton className="h-2.5 w-[64%] rounded-full bg-card-muted" />
            <button
              type="button"
              className={cn('mt-auto self-start text-[13px] text-primary-text', focusRing)}
              onClick={() => {
                abortRef.current?.abort();
                setPhase('idle');
              }}
            >
              {t('ai.cancel')}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-3">
            {phase === 'error' ? (
              <div className="rounded-[var(--radius)] bg-destructive/15 px-2.5 py-2 text-[13px] leading-snug text-destructive">
                {errorText}
              </div>
            ) : null}
            {!canGenerate && !description.trim() ? (
              <div className="flex min-h-[120px] flex-col gap-2 text-[14px] leading-relaxed text-foreground">
                <p>{t('ai.needFacts')}</p>
                <button type="button" className={cn('self-start text-[13px] text-primary-text', focusRing)} onClick={goToVehicle}>
                  {t('ai.toStep', { step: vehicleStep })}
                </button>
              </div>
            ) : (
              <textarea
                id="listing-description"
                rows={8}
                maxLength={DESCRIPTION_MAX}
                value={description}
                placeholder={t('ai.placeholder')}
                onChange={(event) => setCommonField('description', event.target.value)}
                className="min-h-[120px] w-full resize-y bg-transparent text-[15px] leading-relaxed text-foreground outline-none placeholder:text-subtle-foreground"
              />
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
        {untouched && usedFields.length > 0 ? (
          <>
            <span className="hidden sm:inline">{t('ai.used')}</span>
            <ul className="hidden list-none flex-wrap gap-2 sm:flex">
              {usedFields.map((field) => (
                <li key={field} className="rounded-full bg-card-muted px-2.5 py-1 text-[13px] text-foreground">
                  {field}
                </li>
              ))}
            </ul>
            <span className="sm:hidden">
              {t('ai.usedCount', { count: usedFields.length })}{' '}
              <button type="button" className={cn('text-primary-text', focusRing)} onClick={goToVehicle}>
                · {t('ai.changeShort')}
              </button>
            </span>
            <button type="button" className={cn('hidden text-primary-text sm:inline', focusRing)} onClick={goToVehicle}>
              {t('ai.changeData')}
            </button>
          </>
        ) : null}
        <span className="sm:ml-auto">
          {t('ai.counter', { count: description.length, max: DESCRIPTION_MAX })}
        </span>
      </div>

      {bracketOpen ? (
        <div className="flex flex-col gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-[14px] sm:flex-row sm:items-center" role="status">
          <p className="sm:mr-auto">{t('ai.bracketWarning')}</p>
          <Button
            variant="ghost"
            size="sm"
            className="!h-10"
            onClick={() => {
              setBracketOpen(false);
              document.getElementById('listing-description')?.focus();
            }}
          >
            {t('ai.bracketFix')}
          </Button>
          <Button
            size="sm"
            className="!h-10"
            onClick={() => {
              setBracketOpen(false);
              const proceed = proceedRef.current;
              proceedRef.current = null;
              proceed?.();
            }}
          >
            {t('ai.bracketContinue')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function HowAiWorks() {
  const { t } = useTranslation('addItem');
  const enabled = useAiEnabled();
  if (!enabled) return null;
  return (
    <div className="mt-5 hidden flex-col gap-2.5 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] lg:flex">
      <h2 className="text-[15px] font-semibold text-foreground">{t('ai.howTitle')}</h2>
      <p className="text-[14px] leading-relaxed text-muted-foreground">{t('ai.how1')}</p>
      <p className="text-[14px] leading-relaxed text-muted-foreground">{t('ai.how2')}</p>
      <p className="text-[14px] leading-relaxed text-muted-foreground">{t('ai.how3')}</p>
    </div>
  );
}
