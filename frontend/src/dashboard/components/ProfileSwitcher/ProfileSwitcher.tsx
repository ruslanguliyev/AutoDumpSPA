import { useTranslation } from 'react-i18next';
import { ChevronDown, User, Store, Wrench } from 'lucide-react';

import { useActiveProfileStore } from '@/store/useActiveProfileStore';
import type { ActiveProfile } from '@/dashboard/types/dashboard.types';
import { useRef, useState, useCallback, useEffect } from 'react';

const profileOptions: { value: ActiveProfile; icon: typeof User }[] = [
  { value: { type: 'user' }, icon: User },
  { value: { type: 'seller', id: 's1' }, icon: Store },
  { value: { type: 'service', id: 'sv1' }, icon: Wrench },
];

function profileToKey(p: ActiveProfile): string {
  if (p.type === 'user') return 'user';
  return `${p.type}:${p.id}`;
}

function profileMatches(a: ActiveProfile, b: ActiveProfile): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'user' && b.type === 'user') return true;
  return (a as { id: string }).id === (b as { id: string }).id;
}

export function ProfileSwitcher() {
  const { t } = useTranslation('dashboard');
  const { activeProfile, setActiveProfile } = useActiveProfileStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (profile: ActiveProfile) => {
      setActiveProfile(profile);
      setOpen(false);
    },
    [setActiveProfile]
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const current = profileOptions.find((o) => profileMatches(o.value, activeProfile)) ?? profileOptions[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/50"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('profileSwitcher.ariaLabel')}
      >
        <current.icon size={18} className="text-muted-foreground" aria-hidden />
        <span>{t(`profileSwitcher.${profileToKey(current.value)}`)}</span>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-2 min-w-[180px] rounded-xl border border-border bg-card py-1 shadow-lg"
        >
          {profileOptions.map((opt) => {
            const isSelected = profileMatches(opt.value, activeProfile);
            return (
              <li key={profileToKey(opt.value)} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                    isSelected ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted/50'
                  }`}
                >
                  <opt.icon size={18} aria-hidden />
                  {t(`profileSwitcher.${profileToKey(opt.value)}`)}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
