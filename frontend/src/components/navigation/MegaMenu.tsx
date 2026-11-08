import { useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { useNavStore } from '@/shared/store/navStore';
import type { OpenMegaMenuId } from '@/shared/store/navStore';
import type { MegaMenuConfig } from '@/domain/navigation/megaMenu.config';

interface MegaMenuProps {
  config: MegaMenuConfig;
  labelKey: string;
  isMobile?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

const triggerClass =
  'inline-flex h-11 cursor-pointer items-center gap-1 rounded-[var(--radius)] px-2.5 text-[15px] font-semibold text-foreground transition hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

export function MegaMenu({
  config,
  labelKey,
  isMobile = false,
  isExpanded = false,
  onToggle,
  onClose,
}: MegaMenuProps) {
  const { t } = useTranslation('common');
  const containerRef = useRef<HTMLDivElement>(null);
  const openMegaMenu = useNavStore((s) => s.openMegaMenu);
  const setOpenMegaMenu = useNavStore((s) => s.setOpenMegaMenu);
  const closeMegaMenu = useNavStore((s) => s.closeMegaMenu);

  const isOpen = isMobile ? isExpanded : openMegaMenu === config.id;

  const handleOpen = useCallback(() => {
    if (isMobile && onToggle) {
      onToggle();
    } else {
      setOpenMegaMenu(config.id as OpenMegaMenuId);
    }
  }, [config.id, isMobile, onToggle, setOpenMegaMenu]);

  const handleClose = useCallback(() => {
    if (isMobile && onClose) {
      onClose();
    } else {
      closeMegaMenu();
    }
  }, [isMobile, onClose, closeMegaMenu]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpen();
      }
    },
    [handleOpen, handleClose],
  );

  // Close on click outside (desktop)
  useEffect(() => {
    if (isMobile || !isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeMegaMenu();
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [isMobile, isOpen, closeMegaMenu]);

  const label = t(labelKey);

  return (
    <div ref={containerRef} className={isMobile ? 'w-full' : 'relative'}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={`mega-${config.id}`}
        id={`mega-trigger-${config.id}`}
        className={isMobile ? `${triggerClass} w-full justify-between px-4` : triggerClass}
        onClick={isMobile ? handleOpen : undefined}
        onMouseEnter={!isMobile ? handleOpen : undefined}
        onMouseLeave={!isMobile ? handleClose : undefined}
        onKeyDown={handleKeyDown}
      >
        <Link
          to={config.href}
          className="text-inherit no-underline"
          onClick={(e) => {
            if (isMobile) e.preventDefault();
          }}
        >
          {label}
        </Link>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </div>

      {isOpen && (
        <div
          id={`mega-${config.id}`}
          role="menu"
          aria-labelledby={`mega-trigger-${config.id}`}
          className={
            isMobile
              ? 'px-4 pb-2'
              : 'absolute left-0 top-full z-50 mt-2 w-max max-w-[min(90vw,880px)] rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]'
          }
          onMouseEnter={!isMobile ? handleOpen : undefined}
          onMouseLeave={!isMobile ? handleClose : undefined}
        >
          <div
            className={
              isMobile ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-6'
            }
          >
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
                        className="flex min-h-11 items-center rounded-[var(--radius)] px-2 text-[14px] text-foreground transition hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
        </div>
      )}
    </div>
  );
}
