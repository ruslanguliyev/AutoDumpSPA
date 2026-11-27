import { useTranslation } from 'react-i18next';

import { useAddItemStore } from '@/features/addItem/store/useAddItemStore';
import { TEXT_LANGS, type TextLang } from '@/lib/localizeText';

const inputClass =
  'min-h-[120px] w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/**
 * The live car listing's description in the other interface languages. The AI makes them
 * after publishing; the seller can correct them here. Hidden until they exist.
 */
const VehicleTranslations = () => {
  const { t } = useTranslation('addItem');
  const draft = useAddItemStore((state) => state.draft);
  const setVehicleField = useAddItemStore((state) => state.setVehicleField);

  const translations = draft?.vehicle?.translations;
  if (!draft?.vehicle || !translations || !draft.common.description.trim()) return null;

  const edit = (lang: TextLang, value: string) => {
    setVehicleField('translations', {
      ...translations,
      [lang]: { ...(translations[lang] ?? {}), description: value },
    });
    const edited = draft.vehicle?.translationsEdited ?? [];
    if (!edited.includes(lang)) setVehicleField('translationsEdited', [...edited, lang]);
  };

  const others = TEXT_LANGS.filter((lang) => lang !== translations.source);

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
          <label key={lang} className="flex flex-col gap-2 text-sm text-foreground">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t(`translations.languages.${lang}`)} · {t('translations.description')}
            </span>
            <textarea
              className={inputClass}
              lang={lang}
              value={translations[lang]?.description ?? ''}
              onChange={(event) => edit(lang, event.target.value)}
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default VehicleTranslations;
