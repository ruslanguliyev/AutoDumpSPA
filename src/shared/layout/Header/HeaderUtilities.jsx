import { Moon, Sun } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { changeLanguage } from '@/i18n/config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '@/shared/store/theme';

export const HeaderLanguageSelector = ({ value, onChange, compact = false }) => {
  const { t } = useTranslation('common');
  const handleLanguageChange = async (lang) => {
    if (lang === value) return; // Don't change if already selected
    try {
      // Required: do NOT rely on Zustand/URL alone
      await changeLanguage(lang);
      // Keep existing app sync (store + URL)
      await onChange(lang);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={compact ? 'icon' : 'sm'}
          className="shrink-0"
          aria-label={t('labels.language')}
        >
          {compact ? value.toUpperCase() : value.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onSelect={() => {
            handleLanguageChange('en').catch(console.error);
          }}
        >
          EN
        </DropdownMenuItem>
        <DropdownMenuItem 
          onSelect={() => {
            handleLanguageChange('ru').catch(console.error);
          }}
        >
          RU
        </DropdownMenuItem>
        <DropdownMenuItem 
          onSelect={() => {
            handleLanguageChange('az').catch(console.error);
          }}
        >
          AZ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const HeaderThemeToggle = () => {
  const { t } = useTranslation('common');
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDark = theme === 'dark';
  return (
    <Button
      variant="ghost"
      size="icon"
      className="shrink-0"
      aria-label={isDark ? t('labels.switchToLight') : t('labels.switchToDark')}
      onClick={toggleTheme}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  );
};

