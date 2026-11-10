import { useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { changeLanguage } from '@/i18n/config';
import { useThemeStore } from '@/shared/store/theme';
import Button from '@/shared/ui/button';

const LANGUAGES = [
  { code: 'az', label: 'AZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
];

/**
 * Three segments rather than a dropdown: with only three locales, the current one and
 * the alternatives are all readable at a glance and reachable in one tap.
 *
 * `compact` is the phone header, where the bar has room for one control rather than
 * three, so the current language opens a small menu instead.
 */
export const HeaderLanguageSelector = ({ value, onChange, compact = false, className = '' }) => {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  const handleLanguageChange = async (lang) => {
    setIsOpen(false);
    if (lang === value) return;
    try {
      await changeLanguage(lang);
      await onChange(lang);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setIsOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [isOpen]);

  if (compact) {
    return (
      <div className={`relative ${className}`.trim()} ref={rootRef}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('labels.languageSwitcher')}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="text-[13px] font-semibold"
        >
          {String(value).toUpperCase()}
        </Button>
        {isOpen ? (
          <div
            role="menu"
            aria-label={t('labels.languageSwitcher')}
            className="absolute right-0 top-full z-50 mt-2 overflow-hidden rounded-[var(--radius)] border border-border bg-card py-1 shadow-[var(--shadow-card)]"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                role="menuitem"
                lang={lang.code}
                aria-current={lang.code === value ? 'true' : undefined}
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex h-11 w-full items-center px-4 text-[14px] font-semibold transition hover:bg-foreground/5 ${
                  lang.code === value ? 'text-primary-text' : 'text-foreground'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={t('labels.languageSwitcher')}
      // An inset ring, not a border: a 1px border would leave the segments 42px tall inside the 44px box.
      className={`inline-flex h-11 items-center overflow-hidden rounded-[var(--radius)] ring-1 ring-inset ring-border-strong dark:ring-border ${className}`.trim()}
    >
      {LANGUAGES.map((lang) => {
        const isActive = lang.code === value;
        return (
          <button
            key={lang.code}
            type="button"
            lang={lang.code}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => handleLanguageChange(lang.code)}
            className={`h-full px-3 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-transparent text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
            }`}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
};

export const HeaderThemeToggle = ({ className = '' }) => {
  const { t } = useTranslation('common');
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <Button
      variant="icon"
      aria-label={isDark ? t('labels.switchToLight') : t('labels.switchToDark')}
      onClick={toggleTheme}
      className={className}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </Button>
  );
};
