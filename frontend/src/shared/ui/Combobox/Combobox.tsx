import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/shared/utils/cn';

export type ComboboxOption = {
  value: string;
  label: string;
};

const triggerBaseClass =
  'flex w-full min-h-[42px] items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2 text-left text-sm text-foreground shadow-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

const listboxClass =
  'max-h-72 overflow-y-auto overscroll-contain rounded-xl border border-border bg-popover py-1 text-sm text-popover-foreground shadow-lg';

const optionClass =
  'cursor-pointer px-3 py-2 outline-none hover:bg-muted focus:bg-muted aria-selected:bg-primary/15 aria-selected:text-foreground';

export type ComboboxProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  'aria-label'?: string;
};

export function Combobox({
  id: idProp,
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled,
  error,
  className,
  'aria-label': ariaLabel,
}: ComboboxProps) {
  const reactId = useId();
  const listboxId = idProp ?? `combobox-${reactId}`;
  const buttonId = `${listboxId}-trigger`;
  const inputId = `${listboxId}-search`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const highlightedRef = useRef(0);
  useEffect(() => {
    highlightedRef.current = highlighted;
  }, [highlighted]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  /** null until measured — avoids a fixed portal at (0,0) stealing clicks across the page */
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const selectedLabel = useMemo(() => {
    const hit = options.find((o) => o.value === value);
    return hit?.label ?? '';
  }, [options, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    );
  }, [options, query]);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({
      top: r.bottom + 4,
      left: r.left,
      width: Math.max(r.width, 220),
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    updatePosition();
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (listRef.current?.contains(t)) return;
      setOpen(false);
      setQuery('');
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (open) {
      setHighlighted(0);
      setQuery('');
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    const len = filtered.length;
    if (len === 0) {
      if (highlighted !== 0) setHighlighted(0);
      return;
    }
    if (highlighted > len - 1) {
      setHighlighted(len - 1);
    }
  }, [filtered.length, highlighted]);

  const commit = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery('');
    triggerRef.current?.focus();
  };

  const onKeyDownButton = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!open) setOpen(true);
    }
  };

  const onKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setQuery('');
      triggerRef.current?.focus();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const row = filtered[highlightedRef.current];
      if (row) commit(row.value);
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      setHighlighted(0);
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      setHighlighted(Math.max(filtered.length - 1, 0));
    }
  };

  const dropdown =
    open &&
    coords &&
    createPortal(
      <div
        ref={listRef}
        id={listboxId}
        role="listbox"
        className={cn(listboxClass, 'z-[300]')}
        style={{
          position: 'fixed',
          top: coords.top,
          left: coords.left,
          width: coords.width,
        }}
        tabIndex={-1}
        onKeyDown={onKeyDownList}
      >
        <div className="border-b border-border p-2">
          <input
            ref={searchRef}
            id={inputId}
            type="search"
            autoComplete="off"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlighted(0);
            }}
            className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                setOpen(false);
                setQuery('');
                triggerRef.current?.focus();
                return;
              }
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlighted((i) =>
                  Math.min(i + 1, Math.max(filtered.length - 1, 0))
                );
                return;
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlighted((i) => Math.max(i - 1, 0));
                return;
              }
              if (e.key === 'Enter') {
                e.preventDefault();
                const row = filtered[highlightedRef.current];
                if (row) commit(row.value);
              }
            }}
          />
        </div>
        {filtered.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">{emptyText}</div>
        ) : (
          filtered.map((opt, index) => (
            <div
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              tabIndex={-1}
              className={cn(optionClass, index === highlighted && 'bg-muted/80')}
              onMouseEnter={() => setHighlighted(index)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(opt.value)}
            >
              {opt.label}
            </div>
          ))
        )}
      </div>,
      document.body
    );

  return (
    <div className={cn('relative', className)}>
      <button
        ref={triggerRef}
        id={buttonId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-invalid={Boolean(error)}
        aria-label={ariaLabel}
        className={cn(triggerBaseClass, error && 'border-destructive')}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onKeyDownButton}
      >
        <span
          className={cn(
            'truncate',
            !selectedLabel && !value && 'text-muted-foreground'
          )}
        >
          {selectedLabel || (value ? value : '') || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
      </button>
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
      {dropdown}
    </div>
  );
}
