import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ImagePlus, RotateCcw, Send, X } from 'lucide-react';

import { AI_STATUS_QUERY_KEY, aiErrorCode, useAiStatus } from '@/features/ai/ai.api';
import type { AiLanguageCode } from '@/features/ai/ai.api';
import { useLanguageSync } from '@/shared/hooks/useLanguageSync';
import Button from '@/shared/ui/button';
import { Input } from '@/shared/ui/Input';
import { AiSparkle } from '@/shared/ui/AiSparkle/AiSparkle';

import { streamAiChat } from './aiChat.api';
import { PHOTO_TYPES, PhotoError, preparePhoto } from './preparePhoto';
import type { PreparedPhoto } from './preparePhoto';
import { AiChatResultCard } from './AiChatResultCard';
import { useAiChatStore } from './useAiChatStore';

const MAX_LENGTH = 1000;
/** Messages the server reads; it keeps the same number on its side. */
const HISTORY_SENT = 16;

/** Older messages lose their photo; the model still reads its own description of it. */
const PHOTO_MARK = '[photo]';

const toApiLanguage = (lang: string): AiLanguageCode =>
  lang === 'ru' ? 'RU' : lang === 'en' ? 'EN' : 'AZ';

/**
 * The site assistant: one floating chat on every public page. It answers only from the
 * AvtoBaz catalogue; the cards under a reply are the real listings its searches returned.
 * Hidden entirely while the server has AI switched off. While the site-wide daily cap is
 * reached it stays visible and says it is resting until tomorrow.
 */
export function AiChatWidget() {
  const status = useAiStatus();
  if (!status.enabled) return null;
  return <AiChatPanel paused={status.paused} />;
}

function AiChatPanel({ paused }: { paused: boolean }) {
  const { t } = useTranslation('aiChat');
  const { language } = useLanguageSync();
  const { open, entries, setOpen, add, reset } = useAiChatStore();
  const [draft, setDraft] = useState('');
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [photo, setPhoto] = useState<PreparedPhoto | null>(null);
  const [preparing, setPreparing] = useState(false);
  /** The answer as it streams in; moved into the conversation once it is complete. */
  const [streaming, setStreaming] = useState('');
  const [searching, setSearching] = useState(false);
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ blob }: { blob: Blob | null }) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const entries = useAiChatStore.getState().entries.slice(-HISTORY_SENT);
      const history = entries.map((entry, index) => {
        const isNew = index === entries.length - 1;
        const text = entry.photo && !isNew ? [entry.text, PHOTO_MARK].filter(Boolean).join(' ') : entry.text;
        return { role: entry.role, text };
      });
      setStreaming('');
      setSearching(false);
      return streamAiChat(
        history,
        toApiLanguage(language),
        blob,
        {
          onText: (text) => {
            if (controller.signal.aborted) return;
            setSearching(false);
            setStreaming((current) => current + text);
          },
          onSearching: () => {
            if (!controller.signal.aborted) setSearching(true);
          },
        },
        controller.signal,
      );
    },
    onSuccess: (reply) => add({ role: 'ASSISTANT', text: reply.text, cards: reply.cards }),
    onError: (error) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      const code = aiErrorCode(error);
      if (code === 'PAUSED') {
        queryClient.setQueryData(AI_STATUS_QUERY_KEY, { enabled: true, paused: true });
        return;
      }
      setErrorCode(code);
    },
    onSettled: () => {
      setStreaming('');
      setSearching(false);
    },
  });

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [entries.length, mutation.isPending, open, streaming]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if ((!text && !photo) || mutation.isPending || preparing || paused) return;
    setErrorCode(null);
    add({ role: 'USER', text, ...(photo ? { photo: photo.thumbnail } : {}) });
    setDraft('');
    setPhoto(null);
    mutation.mutate({ blob: photo?.blob ?? null });
  };

  const pickPhoto = async (file: File | undefined) => {
    if (fileRef.current) fileRef.current.value = '';
    if (!file) return;
    setErrorCode(null);
    setPreparing(true);
    try {
      setPhoto(await preparePhoto(file));
    } catch (error) {
      setErrorCode(error instanceof PhotoError ? `PHOTO_${error.reason.toUpperCase()}` : 'INVALID_IMAGE');
    } finally {
      setPreparing(false);
    }
  };

  const startOver = () => {
    abortRef.current?.abort();
    mutation.reset();
    setErrorCode(null);
    setPhoto(null);
    reset();
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 h-12 rounded-full px-5 shadow-[var(--shadow-card)] sm:bottom-6 sm:right-6"
        aria-label={t('open')}
      >
        <AiSparkle size={18} />
        <span>{t('launcher')}</span>
      </Button>
    );
  }

  return (
    <section
      role="dialog"
      aria-label={t('title')}
      className="fixed inset-x-0 bottom-0 z-50 flex h-[85dvh] flex-col overflow-hidden rounded-t-2xl border border-border bg-card text-foreground shadow-[var(--shadow-card)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[min(640px,calc(100dvh-48px))] sm:w-[400px] sm:rounded-2xl"
    >
      <header className="flex items-center gap-2 border-b border-border px-4 py-2">
        <AiSparkle size={18} className="text-primary-text" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[15px] font-semibold">{t('title')}</h2>
          <p className="truncate text-[12px] text-muted-foreground">{t('subtitle')}</p>
        </div>
        {entries.length > 0 ? (
          <Button variant="icon" size="icon" onClick={startOver} aria-label={t('reset')} title={t('reset')}>
            <RotateCcw size={18} />
          </Button>
        ) : null}
        <Button variant="icon" size="icon" onClick={() => setOpen(false)} aria-label={t('close')}>
          <X size={18} />
        </Button>
      </header>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3" aria-live="polite">
        <Bubble role="ASSISTANT">{t('greeting')}</Bubble>
        {entries.length === 0 ? (
          <div className="flex flex-wrap gap-2">
            {(['car', 'part', 'service'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setDraft(t(`examples.${key}`))}
                className="min-h-11 rounded-full border border-border px-3 text-left text-[13px] text-muted-foreground transition hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {t(`examples.${key}`)}
              </button>
            ))}
          </div>
        ) : null}
        {entries.map((entry) => (
          <div key={entry.id} className="space-y-2">
            {entry.photo ? (
              <div className="flex justify-end">
                <img
                  src={entry.photo}
                  alt={t('photoAlt')}
                  className="max-h-40 max-w-[60%] rounded-2xl border border-border object-cover"
                />
              </div>
            ) : null}
            {entry.text ? <Bubble role={entry.role}>{entry.text}</Bubble> : null}
            {entry.cards?.length ? (
              <div className="space-y-2">
                {entry.cards.map((card) => (
                  <AiChatResultCard
                    key={`${card.kind}:${card.id}`}
                    card={card}
                    language={language}
                    onOpen={() => {
                      if (window.matchMedia('(max-width: 639px)').matches) setOpen(false);
                    }}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ))}
        {mutation.isPending && streaming ? <Bubble role="ASSISTANT">{streaming}</Bubble> : null}
        {mutation.isPending && !streaming ? (
          <p className="text-[13px] text-muted-foreground" role="status">
            {searching ? t('thinking') : t('waiting')}
          </p>
        ) : null}
        {paused ? (
          <p className="rounded-2xl border border-border px-3 py-2 text-[14px] text-muted-foreground" role="status">
            {t('paused')}
          </p>
        ) : null}
        {errorCode ? (
          <p className="text-[13px] text-destructive" role="alert">
            {t(`errors.${errorCode}`, { defaultValue: t('errors.GENERIC') })}
          </p>
        ) : null}
      </div>

      {photo ? (
        <div className="flex items-center gap-2 border-t border-border px-3 pt-3">
          <img src={photo.thumbnail} alt={t('photoAlt')} className="h-14 w-14 rounded-[var(--radius)] object-cover" />
          <span className="min-w-0 flex-1 text-[13px] text-muted-foreground">
            {t('photoReady')} <span className="text-[12px]">{t('photoPrivacy')}</span>
          </span>
          <Button variant="icon" size="icon" onClick={() => setPhoto(null)} aria-label={t('removePhoto')}>
            <X size={18} />
          </Button>
        </div>
      ) : null}
      <form onSubmit={submit} className="flex items-end gap-2 border-t border-border p-3">
        <input
          ref={fileRef}
          type="file"
          accept={PHOTO_TYPES.join(',')}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => void pickPhoto(event.target.files?.[0])}
        />
        <Button
          variant="icon"
          size="icon"
          onClick={() => fileRef.current?.click()}
          disabled={mutation.isPending || preparing || paused}
          aria-label={t('attachPhoto')}
          title={t('attachPhoto')}
        >
          <ImagePlus size={18} />
        </Button>
        <Input
          label={t('inputLabel')}
          labelHidden
          value={draft}
          maxLength={MAX_LENGTH}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t('placeholder')}
          disabled={paused}
          autoComplete="off"
          wrapperClassName="min-w-0 flex-1"
          autoFocus
        />
        <Button
          type="submit"
          size="icon"
          disabled={(!draft.trim() && !photo) || mutation.isPending || preparing || paused}
          aria-label={t('send')}
        >
          <Send size={18} />
        </Button>
      </form>
      <p className="px-3 pb-2 text-[11px] text-muted-foreground">{t('disclaimer')}</p>
    </section>
  );
}

function Bubble({ role, children }: { role: 'USER' | 'ASSISTANT'; children: string }) {
  const mine = role === 'USER';
  return (
    <div className={mine ? 'flex justify-end' : 'flex justify-start'}>
      <p
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[15px] leading-relaxed [overflow-wrap:anywhere] ${
          mine ? 'bg-primary text-primary-foreground' : 'bg-card-muted text-foreground'
        }`}
      >
        {children}
      </p>
    </div>
  );
}

export default AiChatWidget;
