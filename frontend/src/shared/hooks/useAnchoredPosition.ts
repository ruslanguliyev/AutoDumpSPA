import { type CSSProperties, type RefObject, useCallback, useLayoutEffect, useState } from 'react';

type Align = 'start' | 'end';

type Coords = {
  top: number;
  left: number;
  maxWidth: number;
  maxHeight: number;
};

type Options = {
  open: boolean;
  triggerRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
  align?: Align;
  gap?: number;
  padding?: number;
  /** Preferred panel width in px; clamped to the viewport. */
  preferredWidth?: number;
};

const readHeaderHeight = () => {
  if (typeof window === 'undefined') return 64;
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--header-height').trim();
  const parsed = Number.parseFloat(raw);
  if (raw.endsWith('rem')) return parsed * 16;
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return 64;
};

/**
 * Fixed coords for a portalled panel: below the trigger, flipped above when
 * there is no room, shifted so it stays inside the viewport.
 */
export function useAnchoredPosition({
  open,
  triggerRef,
  panelRef,
  align = 'start',
  gap = 8,
  padding = 8,
  preferredWidth,
}: Options): { style: CSSProperties | undefined } {
  const [coords, setCoords] = useState<Coords | null>(null);

  const update = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const headerH = readHeaderHeight();
    const maxWidth = Math.max(0, vw - padding * 2);
    const maxHeight = Math.max(96, vh - headerH - padding * 2);

    const panel = panelRef.current;
    const measuredW = panel?.offsetWidth ?? preferredWidth ?? rect.width;
    const measuredH = panel?.offsetHeight ?? 0;
    const width = Math.min(Math.max(measuredW, 1), maxWidth);

    let left = align === 'end' ? rect.right - width : rect.left;
    if (left + width > vw - padding) left = vw - padding - width;
    if (left < padding) left = padding;

    const spaceBelow = vh - rect.bottom - padding;
    const spaceAbove = rect.top - padding;
    const need = measuredH > 0 ? Math.min(measuredH, maxHeight) : Math.min(240, maxHeight);
    const placeBelow = spaceBelow >= need || spaceBelow >= spaceAbove;
    const available = placeBelow ? spaceBelow : spaceAbove;
    const heightCap = Math.min(maxHeight, Math.max(96, available));
    const top = placeBelow
      ? rect.bottom + gap
      : Math.max(padding, rect.top - gap - Math.min(measuredH || heightCap, heightCap));

    setCoords({ top, left, maxWidth, maxHeight: heightCap });
  }, [align, gap, padding, panelRef, preferredWidth, triggerRef]);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return undefined;
    }
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, update]);

  if (!open || !coords) return { style: undefined };

  return {
    style: {
      position: 'fixed',
      top: coords.top,
      left: coords.left,
      maxWidth: coords.maxWidth,
      maxHeight: coords.maxHeight,
    },
  };
}
