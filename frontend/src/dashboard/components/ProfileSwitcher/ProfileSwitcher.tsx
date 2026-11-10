import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useRef, useState, useCallback, useEffect } from 'react';

import { profileMatches, profileToKey } from '@/dashboard/config/profileScope';
import { useAvailableProfiles, type ProfileOption } from '@/dashboard/hooks/useAvailableProfiles';
import { useActiveProfileStore } from '@/store/useActiveProfileStore';
import { useAnchoredPosition } from '@/shared/hooks/useAnchoredPosition';
import type { ActiveProfile } from '@/dashboard/types/dashboard.types';

export function ProfileSwitcher() {
  const { t } = useTranslation('dashboard');
  const { activeProfile, setActiveProfile } = useActiveProfileStore();
  const { options, isLoading } = useAvailableProfiles();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const { style } = useAnchoredPosition({
    open,
    triggerRef,
    panelRef,
    align: 'end',
  });

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const handleSelect = useCallback(
    (profile: ActiveProfile) => {
      setActiveProfile(profile);
      close();
    },
    [setActiveProfile, close],
  );

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  const typeLabel = (profile: ActiveProfile) => t(`profileSwitcher.types.${profile.type}`);

  const optionTitle = (opt: ProfileOption) => opt.name || typeLabel(opt.value);

  const optionSubtitle = (opt: ProfileOption) => (opt.name ? typeLabel(opt.value) : null);

  const triggerText = (opt: ProfileOption) => {
    const type = typeLabel(opt.value);
    return opt.name ? `${opt.name} · ${type}` : type;
  };

  if (isLoading || options.length < 2) return null;

  const current = options.find((o) => profileMatches(o.value, activeProfile)) ?? options[0];

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls="profile-switcher-menu"
        aria-label={triggerText(current)}
      >
        <current.icon size={18} className="shrink-0 text-muted-foreground" aria-hidden />
        <span className="max-w-[40vw] truncate">{triggerText(current)}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open
        ? createPortal(
            <ul
              ref={panelRef}
              id="profile-switcher-menu"
              role="listbox"
              className="z-dropdown min-w-max max-w-[calc(100vw-16px)] overflow-y-auto overscroll-contain rounded-xl border border-border bg-card py-1 shadow-lg"
              style={style ?? { position: 'fixed', left: 0, top: 0, visibility: 'hidden' }}
            >
              {options.map((opt) => {
                const isSelected = profileMatches(opt.value, activeProfile);
                const subtitle = optionSubtitle(opt);
                return (
                  <li key={profileToKey(opt.value)} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        isSelected ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <opt.icon size={18} className="shrink-0" aria-hidden />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate">{optionTitle(opt)}</span>
                        {subtitle ? (
                          <span className="text-xs font-normal text-muted-foreground">{subtitle}</span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>,
            document.body,
          )
        : null}
    </div>
  );
}
