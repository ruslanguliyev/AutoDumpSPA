import { Moon, Sun } from 'lucide-react';
import { changeLanguage } from '@/i18n/config';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '@/shared/store/theme';
import { HeaderIconButton } from './HeaderIconButton';
import { useState, useRef, useEffect } from 'react';

export const HeaderLanguageSelector = ({ value, onChange, compact = false, onOpen }) => {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  const handleLanguageChange = async (lang) => {
    if (lang === value) {
      setIsOpen(false);
      return;
    }
    try {
      await changeLanguage(lang);
      await onChange(lang);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  // Закрытие при клике вне области
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('pointerdown', handleClickOutside);
    return () => window.removeEventListener('pointerdown', handleClickOutside);
  }, [isOpen]);

  // Закрыть другие попапы при открытии LanguageBar
  useEffect(() => {
    if (isOpen && onOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'ru', label: 'RU' },
    { code: 'az', label: 'AZ' },
  ];

  return (
    <div className="header__action" ref={popoverRef}>
      <HeaderIconButton
        aria-label={t('labels.language')}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="popover-language"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="header__languageText">
          {value.toUpperCase()}
        </span>
      </HeaderIconButton>
      {isOpen ? (
        <div id="popover-language" className="header__popover header__popover--language" role="menu">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="menuitem"
              className={`header__popoverItem ${lang.code === value ? 'header__popoverItem--active' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              {lang.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const HeaderThemeToggle = () => {
  const { t } = useTranslation('common');
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDark = theme === 'dark';
  
  return (
    <div className="header__action">
      <HeaderIconButton
        aria-label={isDark ? t('labels.switchToLight') : t('labels.switchToDark')}
        onClick={toggleTheme}
      >
        {isDark ? <Sun size={22} /> : <Moon size={22} />}
      </HeaderIconButton>
    </div>
  );
};

