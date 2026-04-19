import { useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { useNavStore } from '@/shared/store/navStore';
import type { MegaMenuConfig } from '@/domain/navigation/megaMenu.config';

interface MegaMenuProps {
  config: MegaMenuConfig;
  labelKey: string;
  isMobile?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

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
      setOpenMegaMenu(config.id);
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
    [handleOpen, handleClose]
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
    <div ref={containerRef} className="header__megaWrap">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={`mega-${config.id}`}
        id={`mega-trigger-${config.id}`}
        className="header__megaTrigger"
        onClick={isMobile ? handleOpen : undefined}
        onMouseEnter={!isMobile ? handleOpen : undefined}
        onMouseLeave={!isMobile ? handleClose : undefined}
        onKeyDown={handleKeyDown}
      >
        <Link
          to={config.href}
          className="header__megaLink"
          onClick={(e) => {
            if (isMobile) e.preventDefault();
          }}
        >
          {label}
        </Link>
        <ChevronDown
          size={16}
          className={`header__megaChevron ${isOpen ? 'header__megaChevron--open' : ''}`}
          aria-hidden
        />
      </div>

      {isOpen && (
        <div
          id={`mega-${config.id}`}
          role="menu"
          aria-labelledby={`mega-trigger-${config.id}`}
          className="header__megaPanel"
          onMouseEnter={!isMobile ? handleOpen : undefined}
          onMouseLeave={!isMobile ? handleClose : undefined}
        >
          <div className="header__megaGrid">
            {config.sections.map((section) => (
              <div key={section.titleKey} className="header__megaColumn">
                <h3 className="header__megaTitle">{t(section.titleKey)}</h3>
                <ul className="header__megaList">
                  {section.items.map((item) => (
                    <li key={item.labelKey}>
                      <Link
                        to={item.href ?? config.href}
                        role="menuitem"
                        className="header__megaItem"
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
