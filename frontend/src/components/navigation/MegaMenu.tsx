import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

import { CAR_BRANDS, getModelsForBrand } from '@/features/addItem/constants/vehicleCatalog';
import type { MegaMenuConfig, MegaMenuSection } from '@/domain/navigation/megaMenu.config';
import { useLanguageSync } from '@/shared/hooks/useLanguageSync';
import { useAnchoredPosition } from '@/shared/hooks/useAnchoredPosition';
import { ROUTES, withLang } from '@/shared/constants/routes';
import { useNavStore } from '@/shared/store/navStore';
import type { OpenMegaMenuId } from '@/shared/store/navStore';
import Button from '@/shared/ui/button';
import Select from '@/shared/ui/Select/Select';

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
  'z-dropdown w-max max-w-[min(90vw,960px)] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)]';

const menuLinkClass =
  'flex min-h-8 items-center rounded-[var(--radius)] px-2 text-[13px] text-foreground no-underline transition hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

const chipLinkClass =
  'inline-flex min-h-8 items-center rounded-full border border-border-strong px-3 text-[13px] font-medium text-foreground no-underline transition hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-border';

const YEAR_OPTIONS = Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) =>
  String(new Date().getFullYear() - i),
);

const brandOptions = CAR_BRANDS.map((brand) => ({ value: brand, label: brand }));

const findSection = (config: MegaMenuConfig, suffix: string) =>
  config.sections.find((section) => section.titleKey.endsWith(suffix));

type PartsByCarFormProps = {
  section: MegaMenuSection;
  onNavigate: () => void;
};

function PartsByCarForm({ section, onNavigate }: PartsByCarFormProps) {
  const { t } = useTranslation('common');
  const { language } = useLanguageSync();
  const navigate = useNavigate();
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');

  const modelOptions = useMemo(() => {
    if (!brand) return [];
    return getModelsForBrand(brand)
      .filter((value) => value !== '__other__')
      .map((value) => ({ value, label: value }));
  }, [brand]);

  const brandLabel = t(section.items[0]?.labelKey ?? 'nav.megaMenu.parts.byCar.brand');
  const modelLabel = t(section.items[1]?.labelKey ?? 'nav.megaMenu.parts.byCar.model');
  const yearLabel = t(section.items[2]?.labelKey ?? 'nav.megaMenu.parts.byCar.year');

  const onFind = () => {
    const query = [brand, model, year].filter(Boolean).join(' ');
    const path = withLang(ROUTES.parts, language);
    onNavigate();
    navigate(query ? `${path}?q=${encodeURIComponent(query)}` : path);
  };

  return (
    <form
      className="flex min-w-[13.5rem] flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onFind();
      }}
    >
      <h3 className="mb-0.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {t(section.titleKey)}
      </h3>
      <Select
        size="md"
        label={brandLabel}
        labelHidden
        placeholder={brandLabel}
        options={brandOptions}
        value={brand}
        onChange={(event) => {
          setBrand(event.target.value);
          setModel('');
        }}
      />
      <Select
        size="md"
        label={modelLabel}
        labelHidden
        placeholder={modelLabel}
        options={modelOptions}
        value={model}
        disabled={!brand}
        onChange={(event) => setModel(event.target.value)}
      />
      <Select
        size="md"
        label={yearLabel}
        labelHidden
        placeholder={yearLabel}
        options={YEAR_OPTIONS.map((value) => ({ value, label: value }))}
        value={year}
        onChange={(event) => setYear(event.target.value)}
      />
      <Button type="submit" className="w-full">
        {t('buttons.search')}
      </Button>
    </form>
  );
}

type ChipRowsProps = {
  section: MegaMenuSection;
  fallbackHref: string;
  onNavigate: () => void;
  allLink?: boolean;
};

function ChipRows({ section, fallbackHref, onNavigate, allLink = false }: ChipRowsProps) {
  const { t } = useTranslation(['common', 'part']);
  return (
    <div>
      <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {t(section.titleKey)}
      </h3>
      <ul className="flex max-h-[calc(2*2rem+0.375rem)] list-none flex-wrap gap-1.5 overflow-hidden">
        {section.items.map((item) => (
          <li key={item.labelKey}>
            <Link
              to={item.href ?? fallbackHref}
              role="menuitem"
              className={chipLinkClass}
              onClick={onNavigate}
            >
              {t(item.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
      {allLink ? (
        <Link
          to={fallbackHref}
          className="mt-1 inline-flex items-center text-[13px] font-medium text-muted-foreground no-underline hover:text-foreground"
          onClick={onNavigate}
        >
          {t('filter.allBrands', { ns: 'part' })}
        </Link>
      ) : null}
    </div>
  );
}

type LinkSectionProps = {
  section: MegaMenuSection;
  fallbackHref: string;
  onNavigate: () => void;
  columns?: 1 | 3;
};

function LinkSection({ section, fallbackHref, onNavigate, columns = 1 }: LinkSectionProps) {
  const { t } = useTranslation('common');
  return (
    <div>
      <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {t(section.titleKey)}
      </h3>
      <ul className={columns === 3 ? 'grid grid-cols-3 gap-x-3' : 'space-y-0.5'}>
        {section.items.map((item) => (
          <li key={item.labelKey}>
            <Link
              to={item.href ?? fallbackHref}
              role="menuitem"
              className={menuLinkClass}
              onClick={onNavigate}
            >
              {t(item.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
    preferredWidth: 960,
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

  const isParts = config.id === 'parts';
  const categories = findSection(config, '.categories');
  const byCar = findSection(config, '.byCar');
  const brands = findSection(config, '.brands');
  const popular = findSection(config, '.popular');

  const stackedSections = (
    <div className="grid grid-cols-1 gap-4">
      {config.sections.map((section) => (
        <LinkSection
          key={section.titleKey}
          section={section}
          fallbackHref={config.href}
          onNavigate={handleClose}
        />
      ))}
    </div>
  );

  const desktopParts = isParts ? (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_13.75rem] lg:items-start">
        {categories ? (
          <LinkSection
            section={categories}
            fallbackHref={config.href}
            onNavigate={handleClose}
            columns={3}
          />
        ) : null}
        {byCar ? (
          <PartsByCarForm section={byCar} onNavigate={handleClose} />
        ) : null}
      </div>
      {brands ? (
        <ChipRows
          section={brands}
          fallbackHref={config.href}
          onNavigate={handleClose}
          allLink
        />
      ) : null}
      {popular ? (
        <ChipRows section={popular} fallbackHref={config.href} onNavigate={handleClose} />
      ) : null}
    </div>
  ) : (
    stackedSections
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
            {stackedSections}
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
              className={panelClass}
              style={style ?? { position: 'fixed', left: 0, top: 0, visibility: 'hidden' }}
            >
              {desktopParts}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
