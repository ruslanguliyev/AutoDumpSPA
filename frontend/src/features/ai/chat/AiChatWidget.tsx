import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { RotateCcw, Send, X } from 'lucide-react';

import { aiErrorCode, useAiEnabled } from '@/features/ai/ai.api';
import type { AiLanguageCode } from '@/features/ai/ai.api';
import { useLanguageSync } from '@/shared/hooks/useLanguageSync';
import Button from '@/shared/ui/button';
import { Input } from '@/shared/ui/Input';
import { AiSparkle } from '@/shared/ui/AiSparkle/AiSparkle';

import { sendAiChat } from './aiChat.api';
import { AiChatResultCard } from './AiChatResultCard';
import { useAiChatStore } from './useAiChatStore';

const MAX_LENGTH = 1000;
/** Messages the server reads; it keeps the same number on its side. */
const HISTORY_SENT = 16;

const toApiLanguage = (lang: string): AiLanguageCode =>
  lang === 'ru' ? 'RU' : lang === 'en' ? 'EN' : 'AZ';

/**
 * The site assistant: one floating chat on every public page. It answers only from the
 * AvtoBaz catalogue; the cards under a reply are the real listings its searches returned.
 * Hidden entirely while the server has AI switched off.
 */
export function AiChatWidget() {
  const enabled = useAiEnabled();
  if (!enabled) return null;
  return <AiChatPanel />;
}

function AiChatPanel() {
  const { t } = useTranslation('aiChat');
  const { language } = useLanguageSync();
  const { open, entries, setOpen, add, reset } = useAiChatStore();
  const [draft, setDraft] = useState('');
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: async (text: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const history = [...useAiChatStore.getState().entries]
        .slice(-HISTORY_SENT)
        .map(({ role, text: body }) => ({ role, text: body }));
      return sendAiChat(history.length ? history : [{ role: 'USER', text }], toApiLanguage(language), controller.signal);
    },
    onSuccess: (reply) => add({ role: 'ASSISTANT', text: reply.text, cards: reply.cards }),
    onError: (error) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setErrorCode(aiErrorCode(error));
    },
  });

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [entries.length, mutation.isPending, open]);

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
    if (!text || mutation.isPending) return;
    setErrorCode(null);
    add({ role: 'USER', text });
    setDraft('');
    mutation.mutate(text);
  };

  const startOver = () => {
    abortRef.current?.abort();
    mutation.reset();
    setErrorCode(null);
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
            <Bubble role={entry.role}>{entry.text}</Bubble>
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
        {mutation.isPending ? (
          <p className="text-[13px] text-muted-foreground" role="status">
            {t('thinking')}
          </p>
        ) : null}
        {errorCode ? (
          <p className="text-[13px] text-destructive" role="alert">
            {t(`errors.${errorCode}`, { defaultValue: t('errors.GENERIC') })}
          </p>
        ) : null}
      </div>

      <form onSubmit={submit} className="flex items-end gap-2 border-t border-border p-3">
        <Input
          label={t('inputLabel')}
          labelHidden
          value={draft}
          maxLength={MAX_LENGTH}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t('placeholder')}
          autoComplete="off"
          wrapperClassName="min-w-0 flex-1"
          autoFocus
        />
        <Button type="submit" size="icon" disabled={!draft.trim() || mutation.isPending} aria-label={t('send')}>
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
