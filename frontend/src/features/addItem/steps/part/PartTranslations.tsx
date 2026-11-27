import { useTranslation } from 'react-i18next';

import { useAddItemStore, type PartLang } from '@/features/addItem/store/useAddItemStore';

const inputClass =
  'min-h-[44px] w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const LANGS: PartLang[] = ['az', 'ru', 'en'];

/**
 * The live listing's name and description in the other interface languages. The AI makes
 * them after publishing; the seller can correct them here. Hidden until they exist.
 */
const PartTranslations = () => {
  const { t } = useTranslation('addItem');
  const draft = useAddItemStore((state) => state.draft);
  const setPartField = useAddItemStore((state) => state.setPartField);

  const translations = draft?.part?.translations;
  if (!draft?.part || !translations) return null;

  const edit = (lang: PartLang, field: 'name' | 'description', value: string) => {
    const current = translations[lang] ?? { name: '', description: null };
    setPartField('translations', { ...translations, [lang]: { ...current, [field]: value } });
    const edited = draft.part?.translationsEdited ?? [];
    if (!edited.includes(lang)) setPartField('translationsEdited', [...edited, lang]);
  };

  const others = LANGS.filter((lang) => lang !== translations.source);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">{t('translations.title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('translations.hint', { language: t(`translations.languages.${translations.source}`) })}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {others.map((lang) => (
          <fieldset key={lang} className="flex flex-col gap-3">
            <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t(`translations.languages.${lang}`)}
            </legend>
            <label className="flex flex-col gap-2 text-sm text-foreground">
              <span>{t('form.partName')}</span>
              <input
                className={inputClass}
                lang={lang}
                value={translations[lang]?.name ?? ''}
                onChange={(event) => edit(lang, 'name', event.target.value)}
              />
            </label>
            {draft.common.description.trim() ? (
              <label className="flex flex-col gap-2 text-sm text-foreground">
                <span>{t('translations.description')}</span>
                <textarea
                  className={`${inputClass} min-h-[120px]`}
                  lang={lang}
                  value={translations[lang]?.description ?? ''}
                  onChange={(event) => edit(lang, 'description', event.target.value)}
                />
              </label>
            ) : null}
          </fieldset>
        ))}
      </div>
    </div>
  );
};

export default PartTranslations;
