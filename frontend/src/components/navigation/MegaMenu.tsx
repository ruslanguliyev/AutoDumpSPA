import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

import { useAnchoredPosition } from '@/shared/hooks/useAnchoredPosition';
import { useNavStore } from '@/shared/store/navStore';
import type { OpenMegaMenuId } from '@/shared/store/navStore';
import type { MegaMenuConfig } from '@/domain/navigation/megaMenu.config';

interface MegaMenuProps {
  config: MegaMenuConfig;
  labelKey: string;
  active?: boolean;
  isMobile?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

const triggerBase =
  'inline-flex h-11 cursor-pointer items-center gap-1 rounded-[var(--radius)] px-2.5 text-[15px] font-semibold transition bg-transparent focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

const panelClass =
  'z-dropdown w-[min(90vw,880px)] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]';

export function MegaMenu({
  config,
  labelKey,
  active = false,
  isMobile = false,
  isExpanded = false,
  onToggle,
  onClose,
}: MegaMenuProps) {
  const { t } = useTranslation('common');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const panelId = `mega-${config.id}-${reactId}`;
  const openMegaMenu = useNavStore((s) => s.openMegaMenu);
  const setOpenMegaMenu = useNavStore((s) => s.setOpenMegaMenu);
  const closeMegaMenu = useNavStore((s) => s.closeMegaMenu);

  const isOpen = isMobile ? isExpanded : openMegaMenu === config.id;
  const { style } = useAnchoredPosition({
    open: Boolean(!isMobile && isOpen),
    triggerRef,
    panelRef,
    align: 'start',
    preferredWidth: 720,
  });

  const handleClose = useCallback(() => {
    if (isMobile && onClose) {
      onClose();
    } else {
      closeMegaMenu();
    }
    triggerRef.current?.focus();
  }, [isMobile, onClose, closeMegaMenu]);

  const handleToggle = useCallback(() => {
    if (isMobile && onToggle) {
      onToggle();
      return;
    }
    if (isOpen) {
      closeMegaMenu();
      triggerRef.current?.focus();
    } else {
      setOpenMegaMenu(config.id as OpenMegaMenuId);
    }
  }, [config.id, isMobile, isOpen, onToggle, closeMegaMenu, setOpenMegaMenu]);

  useEffect(() => {
    if (!isOpen || isMobile) return undefined;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      closeMegaMenu();
      triggerRef.current?.focus();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      handleClose();
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, isMobile, closeMegaMenu, handleClose]);

  const label = t(labelKey);
  const triggerClass = `${triggerBase} ${active ? 'text-primary-text' : 'text-foreground hover:bg-foreground/5'} ${
    isMobile ? 'w-full justify-between px-4' : ''
  }`;

  const sections = (
    <div className={isMobile ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 gap-6 lg:grid-cols-2'}>
      {config.sections.map((section) => (
        <div key={section.titleKey}>
          <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {t(section.titleKey)}
          </h3>
          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <li key={item.labelKey}>
                <Link
                  to={item.href ?? config.href}
                  role="menuitem"
                  className="flex min-h-11 items-center rounded-[var(--radius)] px-2 text-[14px] text-foreground no-underline transition hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={handleClose}
                >
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <div className="w-full">
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-controls={panelId}
          className={triggerClass}
          aria-current={active ? 'page' : undefined}
          onClick={handleToggle}
        >
          <span>{label}</span>
          <ChevronDown
            size={16}
            strokeWidth={1.5}
            className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>
        {isOpen ? (
          <div id={panelId} role="menu" aria-label={label} className="px-4 pb-2">
            {sections}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={panelId}
        className={triggerClass}
        aria-current={active ? 'page' : undefined}
        onClick={handleToggle}
      >
        <span>{label}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {isOpen
        ? createPortal(
            <div
              ref={panelRef}
              id={panelId}
              role="menu"
              aria-label={label}
              className={`${panelClass} max-h-[calc(100dvh-var(--header-height)-16px)]`}
              style={style ?? { position: 'fixed', left: 0, top: 0, visibility: 'hidden' }}
            >
              {sections}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
