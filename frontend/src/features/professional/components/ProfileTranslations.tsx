import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { TranslationEntry } from '@/features/professional/api/professional.api';
import { useSaveTranslations } from '@/features/professional/hooks/useProfessional';
import { TEXT_LANGS, type TextLang, type TextTranslations } from '@/lib/localizeText';

const inputClass =
  'min-h-[44px] w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground';

export type TranslatableField = {
  key: string;
  label: string;
  multiline?: boolean;
};

type Props = {
  kind: 'specialist' | 'serviceCenter';
  id: string;
  /** The stored translations of the saved text; null until the AI has made them. */
  translations: TextTranslations | null;
  /** The saved fields that have text, in display order. */
  fields: TranslatableField[];
};

/**
 * The profile's text in the other interface languages. The AI makes it after a save; the owner
 * can correct it here and save the corrections on their own.
 */
export function ProfileTranslations({ kind, id, translations, fields }: Props) {
  const { t } = useTranslation('dashboard');
  const save = useSaveTranslations();
  const [values, setValues] = useState<TextTranslations | null>(translations);
  const [edited, setEdited] = useState<TextLang[]>([]);
  const [saved, setSaved] = useState(false);

  if (!fields.length) return null;
  if (!values) {
    return <p className="text-sm text-muted-foreground">{t('professional.translations.pending')}</p>;
  }

  const others = TEXT_LANGS.filter((lang) => lang !== values.source);

  const edit = (lang: TextLang, key: string, text: string) => {
    setValues({ ...values, [lang]: { ...(values[lang] ?? {}), [key]: text } });
    if (!edited.includes(lang)) setEdited([...edited, lang]);
    setSaved(false);
  };

  const onSave = () => {
    const entries: TranslationEntry[] = edited.flatMap((lang) =>
      fields
        .map((field) => ({ lang, key: field.key, text: values[lang]?.[field.key]?.trim() ?? '' }))
        .filter((entry) => entry.text),
    );
    if (!entries.length) return;
    save.mutate([kind, id, entries], {
      onSuccess: () => {
        setEdited([]);
        setSaved(true);
      },
    });
  };

  return (
    <section className="space-y-4 rounded-2xl border border-border p-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">{t('professional.translations.title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('professional.translations.hint', {
            language: t(`professional.translations.languages.${values.source}`),
          })}
        </p>
      </div>

      {others.map((lang) => (
        <fieldset key={lang} className="space-y-3">
          <legend className={labelClass}>{t(`professional.translations.languages.${lang}`)}</legend>
          {fields.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-sm text-foreground" htmlFor={`tr-${lang}-${field.key}`}>
                {field.label}
              </label>
              {field.multiline ? (
                <textarea
                  id={`tr-${lang}-${field.key}`}
                  className={inputClass}
                  rows={4}
                  lang={lang}
                  value={values[lang]?.[field.key] ?? ''}
                  onChange={(e) => edit(lang, field.key, e.target.value)}
                />
              ) : (
                <input
                  id={`tr-${lang}-${field.key}`}
                  className={inputClass}
                  lang={lang}
                  value={values[lang]?.[field.key] ?? ''}
                  onChange={(e) => edit(lang, field.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </fieldset>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={save.isPending || !edited.length}
          className="min-h-[44px] rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-accent disabled:opacity-60"
        >
          {t('professional.translations.save')}
        </button>
        {saved ? <span className="text-sm text-success">{t('professional.translations.saved')}</span> : null}
        {save.error ? (
          <span role="alert" className="text-sm text-destructive">
            {save.error.message}
          </span>
        ) : null}
      </div>
    </section>
  );
}
