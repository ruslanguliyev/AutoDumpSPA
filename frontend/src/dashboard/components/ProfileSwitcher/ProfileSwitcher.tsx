import { useTranslation } from 'react-i18next';
import { ChevronDown, User, Store, Wrench } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useActiveProfileStore } from '@/store/useActiveProfileStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAnchoredPosition } from '@/shared/hooks/useAnchoredPosition';
import { settingsApi } from '@/dashboard/api/settings.api';
import { professionalApi } from '@/features/professional/api/professional.api';
import type { ActiveProfile } from '@/dashboard/types/dashboard.types';

type ProfileOption = {
  value: ActiveProfile;
  name: string | null;
  icon: typeof User;
};

function profileToKey(p: ActiveProfile): string {
  if (p.type === 'user') return 'user';
  return `${p.type}-${p.id}`;
}

function profileMatches(a: ActiveProfile, b: ActiveProfile): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'user' && b.type === 'user') return true;
  return (a as { id: string }).id === (b as { id: string }).id;
}

function useAvailableProfiles(): { options: ProfileOption[]; isLoading: boolean } {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userName = useAuthStore((s) => s.user?.fullName?.trim() || null);

  const sellerQuery = useQuery({
    queryKey: ['settings', 'seller'],
    queryFn: settingsApi.mySeller,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
  const serviceQuery = useQuery({
    queryKey: ['professional', 'service-center'],
    queryFn: professionalApi.myServiceCenter,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const options = useMemo<ProfileOption[]>(() => {
    const list: ProfileOption[] = [{ value: { type: 'user' }, name: userName, icon: User }];
    const seller = sellerQuery.data;
    if (seller?.id) {
      list.push({
        value: { type: 'seller', id: seller.id },
        name: seller.name?.trim() || null,
        icon: Store,
      });
    }
    const service = serviceQuery.data;
    if (service?.id) {
      list.push({
        value: { type: 'service', id: service.id },
        name: service.name?.trim() || null,
        icon: Wrench,
      });
    }
    return list;
  }, [userName, sellerQuery.data, serviceQuery.data]);

  return {
    options,
    isLoading: sellerQuery.isLoading || serviceQuery.isLoading,
  };
}

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

  useEffect(() => {
    if (isLoading) return;
    const stillValid = options.some((o) => profileMatches(o.value, activeProfile));
    if (!stillValid) setActiveProfile({ type: 'user' });
  }, [isLoading, options, activeProfile, setActiveProfile]);

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
